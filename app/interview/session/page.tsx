"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { InterviewHeader } from "@/components/interview/InterviewHeader";
import { AIAvatar } from "@/components/avatar/AIAvatar";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { AnswerInput } from "@/components/interview/AnswerInput";
import { SessionManager } from "@/lib/interview/session-manager";
import { BrowserSpeechService } from "@/lib/utils/speech";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import { AvatarState } from "@/types/avatar";
import { InterviewSession, InterviewQuestion } from "@/types/interview";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function InterviewSessionPage() {
  const router = useRouter();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [captionText, setCaptionText] = useState<string>("");
  const [isCompletedTransition, setIsCompletedTransition] = useState(false);

  const speechCleanupRef = useRef<(() => void) | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Load session from storage or redirect if empty
  useEffect(() => {
    const active = SessionManager.getActiveSession();
    if (!active || !active.questions || active.questions.length === 0) {
      router.replace("/interview/setup");
      return;
    }
    setSession(active);
  }, [router]);

  // Read out current question with AI speech synthesis
  const speakQuestion = useCallback((qText: string) => {
    setAvatarState("speaking");
    setCaptionText(qText);

    BrowserSpeechService.speak(qText, {
      pitch: 1.0,
      rate: 1.0,
      onStart: () => {
        setAvatarState("speaking");
      },
      onEnd: () => {
        setAvatarState("idle");
      },
      onError: () => {
        setAvatarState("idle");
      },
    });
  }, []);

  // Trigger TTS whenever question index changes
  useEffect(() => {
    if (session && session.questions[session.currentQuestionIndex]) {
      const currentQ = session.questions[session.currentQuestionIndex];
      speakQuestion(currentQ.question);
      startTimeRef.current = Date.now();
      AnalyticsTracker.track("question_answered", { questionId: currentQ.id }, session.id);
    }

    return () => {
      BrowserSpeechService.stopSpeaking();
      if (speechCleanupRef.current) {
        speechCleanupRef.current();
      }
    };
  }, [session?.currentQuestionIndex, speakQuestion]);

  // Voice recording toggle
  const handleToggleListening = () => {
    if (isListening) {
      BrowserSpeechService.stopListening();
      if (speechCleanupRef.current) speechCleanupRef.current();
      setIsListening(false);
      setAvatarState("idle");
      AnalyticsTracker.track("speech_recognition_stopped");
    } else {
      BrowserSpeechService.stopSpeaking();
      setIsListening(true);
      setAvatarState("listening");
      AnalyticsTracker.track("speech_recognition_started");

      const stopFn = BrowserSpeechService.startListening({
        onResult: (transcript, isFinal) => {
          setVoiceTranscript(transcript);
        },
        onError: (err) => {
          console.warn("Speech recognition warning:", err);
          setIsListening(false);
          setAvatarState("idle");
        },
        onEnd: () => {
          setIsListening(false);
          setAvatarState("idle");
        },
      });

      speechCleanupRef.current = stopFn;
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async (answerText: string, mode: "voice" | "text") => {
    if (!session) return;

    if (isListening) {
      BrowserSpeechService.stopListening();
      setIsListening(false);
    }
    BrowserSpeechService.stopSpeaking();

    const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const currentQ: InterviewQuestion = session.questions[session.currentQuestionIndex];

    setIsEvaluating(true);
    setAvatarState("thinking");
    setStatusMessage("Evaluating response and analyzing context...");

    // Record answer
    SessionManager.recordAnswer(session.id, currentQ.id, answerText, durationSeconds, mode);
    AnalyticsTracker.track(
      "question_answered",
      {
        questionId: currentQ.id,
        durationSeconds,
        mode,
        wordCount: answerText.split(/\s+/).length,
      },
      session.id
    );

    // Build recent conversation history
    const history = session.questions
      .slice(0, session.currentQuestionIndex + 1)
      .map((q) => ({
        questionId: q.id,
        questionText: q.question,
        category: q.category,
        userAnswer: q.id === currentQ.id ? answerText : (session.answers[q.id]?.answerText || ""),
      }));

    try {
      // 1. Evaluate current answer
      const evalRes = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: session.options.role,
          difficulty: session.options.difficulty,
          interviewType: session.options.interviewType,
          experienceLevel: session.options.experienceLevel,
          question: currentQ,
          userAnswer: answerText,
          conversationHistory: history,
          canFollowUp: !currentQ.isFollowUp && session.currentQuestionIndex < session.questions.length - 1,
        }),
      });

      const evalData = await evalRes.json();
      if (evalData.evaluation) {
        SessionManager.recordEvaluation(session.id, evalData.evaluation);
      }

      // Check if AI generated a contextual follow-up question
      if (evalData.followUpQuestion) {
        SessionManager.insertFollowUpQuestion(session.id, evalData.followUpQuestion);
      }

      // Re-read updated session from storage
      const updatedSession = SessionManager.getActiveSession() || session;
      const nextIndex = updatedSession.currentQuestionIndex + 1;

      if (nextIndex < updatedSession.questions.length) {
        // Advance to next question
        updatedSession.currentQuestionIndex = nextIndex;
        SessionManager.saveSession(updatedSession);
        setSession(updatedSession);
        setVoiceTranscript("");
        setIsEvaluating(false);
        setAvatarState("idle");
      } else {
        // Interview complete!
        setIsCompletedTransition(true);
        setStatusMessage("Interview complete. Generating your scorecard...");

        const finalScorecardRes = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "scorecard",
            role: updatedSession.options.role,
            difficulty: updatedSession.options.difficulty,
            interviewType: updatedSession.options.interviewType,
            experienceLevel: updatedSession.options.experienceLevel,
            questions: updatedSession.questions,
            answers: updatedSession.answers,
            evaluations: updatedSession.evaluations,
          }),
        });

        const scorecardData = await finalScorecardRes.json();
        if (scorecardData.scorecard) {
          SessionManager.completeSession(updatedSession.id, scorecardData.scorecard);
          AnalyticsTracker.track(
            "interview_completed",
            { score: scorecardData.scorecard.overallScore },
            updatedSession.id
          );
        }

        router.push("/interview/results");
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      // Ensure smooth progression even if network hiccups
      const updatedSession = SessionManager.getActiveSession() || session;
      const nextIndex = updatedSession.currentQuestionIndex + 1;
      if (nextIndex < updatedSession.questions.length) {
        updatedSession.currentQuestionIndex = nextIndex;
        SessionManager.saveSession(updatedSession);
        setSession(updatedSession);
        setIsEvaluating(false);
        setAvatarState("idle");
      } else {
        router.push("/interview/results");
      }
    }
  };

  const handleEndInterview = () => {
    if (confirm("Are you sure you want to end this interview session? Your progress up to this question will be saved.")) {
      router.push("/");
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const currentQ = session.questions[session.currentQuestionIndex];

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header Bar */}
      <InterviewHeader
        role={session.options.role}
        difficulty={session.options.difficulty}
        currentQuestion={session.currentQuestionIndex + 1}
        totalQuestions={session.questions.length}
        onEndInterview={handleEndInterview}
      />

      {/* Main Interactive Stage */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-between space-y-6">
        {/* Prominent AI Avatar */}
        <AIAvatar
          state={avatarState}
          interviewerName="Alex"
          roleTitle={`${session.options.role} Interviewer`}
          caption={captionText}
        />

        {/* Current Question */}
        {currentQ && !isCompletedTransition && (
          <QuestionCard
            question={currentQ}
            onReplayAudio={() => speakQuestion(currentQ.question)}
            isSpeaking={avatarState === "speaking"}
          />
        )}

        {/* Loading / Evaluating Status Overlay */}
        {(isEvaluating || isCompletedTransition) && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-purple-200 text-xs animate-pulse shadow-lg">
            {isCompletedTransition ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            )}
            <span className="font-medium">{statusMessage}</span>
          </div>
        )}

        {/* Input Interface */}
        {!isCompletedTransition && (
          <AnswerInput
            isListening={isListening}
            onToggleListening={handleToggleListening}
            onSubmitAnswer={handleSubmitAnswer}
            disabled={isEvaluating || avatarState === "speaking"}
            externalTranscript={voiceTranscript}
          />
        )}
      </div>
    </div>
  );
}
