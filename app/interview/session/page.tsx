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
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";

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
  const pendingEvalsRef = useRef<Promise<any>[]>([]);

  // Load session from storage or redirect if empty
  useEffect(() => {
    const active = SessionManager.getActiveSession();
    if (!active || !active.questions || active.questions.length === 0) {
      router.replace("/interview/setup");
      return;
    }
    if (active.status === "completed") {
      router.replace("/interview/results");
      return;
    }
    setSession(active);

    // Trap history so clicking browser Back button doesn't reload past questions
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      if (confirm("Are you sure you want to leave this active interview? Your progress in this session will end.")) {
        SessionManager.clearActiveSession();
        router.replace("/interview/setup");
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  // Read out current question with AI speech synthesis
  const speakQuestion = useCallback((qText: string) => {
    setAvatarState("speaking");
    setCaptionText(qText);

    BrowserSpeechService.speak(qText, {
      pitch: 1.0,
      rate: 1.05,
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

  // Submit Answer with Snappy Fast Transition
  const handleSubmitAnswer = async (answerText: string, mode: "voice" | "text") => {
    if (!session) return;

    if (isListening) {
      BrowserSpeechService.stopListening();
      setIsListening(false);
    }
    BrowserSpeechService.stopSpeaking();

    const isSkipped = answerText.toLowerCase().includes("skip");
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const currentQ: InterviewQuestion = session.questions[session.currentQuestionIndex];
    const isLastQuestion = session.currentQuestionIndex >= session.questions.length - 1;

    setIsEvaluating(true);
    setAvatarState("thinking");
    setStatusMessage(
      isSkipped
        ? "Skipping to next question..."
        : isLastQuestion
        ? "Finalizing interview & generating scorecard..."
        : "Analyzing response..."
    );

    // Record answer in storage immediately
    SessionManager.recordAnswer(session.id, currentQ.id, answerText, durationSeconds, mode);
    AnalyticsTracker.track(
      "question_answered",
      {
        questionId: currentQ.id,
        durationSeconds,
        mode,
        isSkipped,
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
      // Evaluation promise
      const evalPromise = fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: session.options.role,
          difficulty: session.options.difficulty,
          interviewType: session.options.interviewType,
          experienceLevel: session.options.experienceLevel,
          question: currentQ,
          userAnswer: answerText,
          resumeText: session.options.resumeText || "",
          conversationHistory: history,
          canFollowUp: !currentQ.isFollowUp && !isLastQuestion,
        }),
      })
        .then((res) => res.json())
        .then((evalData) => {
          if (evalData?.evaluation) {
            SessionManager.recordEvaluation(session.id, evalData.evaluation);
          }
          if (evalData?.followUpQuestion) {
            SessionManager.insertFollowUpQuestion(session.id, evalData.followUpQuestion);
          }
        })
        .catch((err) => console.warn("Evaluation note:", err));

      pendingEvalsRef.current.push(evalPromise);

      if (!isLastQuestion) {
        // Fast optimistic transition (max 400ms pause)
        await Promise.race([
          evalPromise,
          new Promise((resolve) => setTimeout(resolve, 400)),
        ]);

        const updatedSession = SessionManager.getActiveSession() || session;
        const nextIndex = updatedSession.currentQuestionIndex + 1;

        if (nextIndex < updatedSession.questions.length) {
          updatedSession.currentQuestionIndex = nextIndex;
          SessionManager.saveSession(updatedSession);
          setSession({ ...updatedSession });
          setVoiceTranscript("");
          setIsEvaluating(false);
          setAvatarState("idle");
        }
      } else {
        // Last question: wait max 600ms for pending evals
        await Promise.race([
          Promise.allSettled(pendingEvalsRef.current),
          new Promise((r) => setTimeout(r, 600)),
        ]);

        setIsCompletedTransition(true);
        setStatusMessage("Calculating final scorecard...");

        const updatedSession = SessionManager.getActiveSession() || session;
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
            resumeText: updatedSession.options.resumeText || "",
          }),
        });

        const scorecardData = await finalScorecardRes.json();
        if (scorecardData?.scorecard) {
          SessionManager.completeSession(updatedSession.id, scorecardData.scorecard);
          AnalyticsTracker.track(
            "interview_completed",
            { score: scorecardData.scorecard.overallScore },
            updatedSession.id
          );
        }

        router.replace("/interview/results");
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      const updatedSession = SessionManager.getActiveSession() || session;
      const nextIndex = updatedSession.currentQuestionIndex + 1;
      if (nextIndex < updatedSession.questions.length) {
        updatedSession.currentQuestionIndex = nextIndex;
        SessionManager.saveSession(updatedSession);
        setSession({ ...updatedSession });
        setIsEvaluating(false);
        setAvatarState("idle");
      } else {
        router.replace("/interview/results");
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const currentQ = session.questions[session.currentQuestionIndex];

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-30 bg-[#090a10]/80 backdrop-blur-md border-b border-white/5">
        <InterviewHeader
          role={session.options.role}
          difficulty={session.options.difficulty}
          currentQuestion={session.currentQuestionIndex + 1}
          totalQuestions={session.questions.length}
          onEndInterview={handleEndInterview}
        />
      </div>

      {/* Main Centered Stage */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center justify-start space-y-4">
        {/* Prominent AI Avatar (Named Sara) */}
        <div className="w-full flex justify-center shrink-0">
          <AIAvatar
            state={avatarState}
            interviewerName="Sara"
            roleTitle={`${session.options.role} Interviewer`}
            className="p-1 sm:p-2"
          />
        </div>

        {/* Current Question Card */}
        {currentQ && !isCompletedTransition && (
          <div className="w-full">
            <QuestionCard
              question={currentQ}
              onReplayAudio={() => speakQuestion(currentQ.question)}
              isSpeaking={avatarState === "speaking"}
            />
          </div>
        )}

        {/* Loading / Evaluating Status Overlay */}
        {(isEvaluating || isCompletedTransition) && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs animate-pulse shadow-lg">
            {isCompletedTransition ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
            )}
            <span className="font-medium text-center">{statusMessage}</span>
          </div>
        )}

        {/* Input Interface */}
        {!isCompletedTransition && (
          <div className="w-full pb-6">
            <AnswerInput
              isListening={isListening}
              onToggleListening={handleToggleListening}
              onSubmitAnswer={handleSubmitAnswer}
              onSkipQuestion={() => handleSubmitAnswer("Question skipped by candidate", "text")}
              disabled={isEvaluating || avatarState === "speaking"}
              externalTranscript={voiceTranscript}
            />
          </div>
        )}
      </main>
    </div>
  );
}
