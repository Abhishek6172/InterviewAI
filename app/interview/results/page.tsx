"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { RecommendationList } from "@/components/dashboard/RecommendationList";
import { FeedbackModal } from "@/components/interview/FeedbackModal";
import { SessionManager } from "@/lib/interview/session-manager";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import { InterviewSession } from "@/types/interview";
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Star,
  ArrowLeft,
} from "lucide-react";

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const querySessionId = searchParams.get("sessionId");

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showFloatingFeedbackPrompt, setShowFloatingFeedbackPrompt] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    let targetSession: InterviewSession | null = null;

    if (querySessionId) {
      targetSession = SessionManager.getSessionById(querySessionId);
    }

    if (!targetSession) {
      targetSession = SessionManager.getActiveSession();
    }

    if (!targetSession) {
      router.replace("/interview/setup");
      return;
    }

    setSession(targetSession);
    AnalyticsTracker.track("results_viewed", {}, targetSession.id);

    // Prevent browser Back button from navigating into completed interview
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      router.replace("/profile");
    };
    window.addEventListener("popstate", handlePopState);

    // Scroll listener to show slide-up feedback prompt
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowFloatingFeedbackPrompt(true);
      } else {
        setShowFloatingFeedbackPrompt(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router, querySessionId]);

  const scrollToFeedback = () => {
    document.getElementById("feedback-form-section")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!session || !session.scorecard) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">No completed interview session found.</h2>
        <p className="text-sm text-slate-400">Please start a new mock interview session to view results.</p>
        <Link href="/interview/setup">
          <Button variant="glow">Start Mock Interview</Button>
        </Link>
      </div>
    );
  }

  const { scorecard, options, questions, answers, evaluations } = session;

  const handleRetry = () => {
    AnalyticsTracker.track("retry_clicked", {}, session.id);
    router.push("/interview/setup");
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-10 space-y-8 relative">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="success" className="gap-1 text-xs">
              <Award className="w-3.5 h-3.5" /> Interview Complete
            </Badge>
            <span className="text-xs text-slate-400 capitalize">{options.difficulty} Difficulty</span>
            <span className="text-xs text-slate-400">&bull; {options.experienceLevel}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Interview Performance Scorecard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Evaluated for <span className="text-slate-200 font-semibold">{options.role}</span> &bull;{" "}
            {questions.length} Questions Answered
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="glow" size="sm" onClick={handleRetry} className="gap-2 text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            Try Another Interview
          </Button>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs text-slate-400">
              Home
            </Button>
          </Link>
        </div>
      </div>

      {/* 5-Dimensional Metric Breakdown and Overall Score */}
      <ScoreCard scorecard={scorecard} />

      {/* Strengths, Areas to Improve & Suggested Next Steps */}
      <RecommendationList scorecard={scorecard} />

      {/* Question-by-Question Deep Dive */}
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-purple-400" />
          Question-by-Question Review
        </h3>

        <div className="space-y-3">
          {questions.map((q, idx) => {
            const ans = answers[q.id];
            const ev = evaluations[q.id];
            const isExpanded = expandedQuestion === q.id || (expandedQuestion === null && idx === 0);

            return (
              <Card key={q.id} className="border-white/10 glass-panel overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedQuestion(isExpanded ? "" : q.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="w-6 h-6 rounded-full bg-purple-600/20 text-purple-400 text-xs flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-slate-400 capitalize">{q.category}</span>
                        {q.isFollowUp && (
                          <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                            Contextual Follow-up
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-white block">{q.question}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {ev && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/25">
                        {ev.score}/10
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <CardContent className="p-4 pt-2 border-t border-white/5 space-y-4 bg-slate-900/40">
                    {/* User Answer */}
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-400">Your Answer:</span>
                      <p className="text-xs text-slate-200 p-3 rounded-xl bg-white/5 border border-white/5 leading-relaxed italic">
                        &ldquo;{ans?.answerText || "No answer recorded"}&rdquo;
                      </p>
                    </div>

                    {/* AI Feedback */}
                    {ev && (
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-semibold text-purple-400 block mb-1">Sara Evaluation:</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{ev.feedback}</p>
                        </div>

                        {/* What was good & What could improve */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {ev.whatWasGood && ev.whatWasGood.length > 0 && (
                            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> What Was Good
                              </span>
                              <ul className="space-y-1">
                                {ev.whatWasGood.map((good, i) => (
                                  <li key={i} className="text-[11px] text-slate-200 flex items-start gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                    <span>{good}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {ev.whatCouldImprove && ev.whatCouldImprove.length > 0 && (
                            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1.5">
                              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" /> What Could Improve
                              </span>
                              <ul className="space-y-1">
                                {ev.whatCouldImprove.map((imp, i) => (
                                  <li key={i} className="text-[11px] text-slate-200 flex items-start gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                    <span>{imp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* High-Prominence Candidate Feedback Form Section */}
      <div className="pt-6">
        <FeedbackModal
          sessionId={session.id}
          onFeedbackSubmitted={() => setFeedbackSubmitted(true)}
        />
      </div>

      {/* Footer CTA */}
      <div className="pt-6 flex justify-center">
        <Button size="lg" variant="glow" onClick={handleRetry} className="gap-2">
          Try Another Interview
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Sticky Slide-up Popup Prompt on Scroll */}
      {showFloatingFeedbackPrompt && !feedbackSubmitted && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-3.5 rounded-2xl bg-[#0e101a]/95 border border-purple-500/40 backdrop-blur-xl shadow-2xl shadow-purple-500/20 flex items-center justify-between gap-3 ring-1 ring-purple-500/30">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Rate your interview with Sara</span>
                <span className="text-[11px] text-slate-400">Takes 60 seconds &bull; Help us improve</span>
              </div>
            </div>

            <Button
              type="button"
              variant="glow"
              size="sm"
              onClick={scrollToFeedback}
              className="text-xs h-8 px-3.5 shrink-0 cursor-pointer"
            >
              Review Now ⭐
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
