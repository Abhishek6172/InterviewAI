"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ThumbsUp, ThumbsDown, Star, Send, CheckCircle2 } from "lucide-react";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import { ValidationFeedback } from "@/types/analytics";
import { cn } from "@/lib/utils/cn";

interface FeedbackModalProps {
  sessionId: string;
  onFeedbackSubmitted?: () => void;
}

export function FeedbackModal({ sessionId, onFeedbackSubmitted }: FeedbackModalProps) {
  const [isUseful, setIsUseful] = useState<boolean | null>(null);
  const [realismRating, setRealismRating] = useState<number>(4);
  const [wouldUseAgain, setWouldUseAgain] = useState<"yes" | "maybe" | "no" | null>("yes");
  const [confusingAspects, setConfusingAspects] = useState("");
  const [improvements, setImprovements] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedbackData: ValidationFeedback = {
      id: `fb_${Date.now()}`,
      sessionId,
      isUseful,
      realismRating,
      experienceRating: realismRating,
      wouldUseAgain,
      confusingAspects: confusingAspects.trim() || undefined,
      improvementSuggestions: improvements.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };

    // Save locally
    AnalyticsTracker.saveFeedback(feedbackData);
    AnalyticsTracker.track("feedback_submitted", feedbackData, sessionId);

    // Send to backend API
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      });
    } catch (err) {
      console.warn("Feedback API offline, saved locally:", err);
    }

    setIsSubmitting(false);
    setSubmitted(true);
    onFeedbackSubmitted?.();
  };

  if (submitted) {
    return (
      <Card className="glass-panel-glow border-emerald-500/30 p-6 text-center">
        <CardContent className="p-0 flex flex-col items-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
          <h4 className="text-base font-semibold text-white">Thank you for your real feedback!</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Your evaluation directly informs our next two-week validation tests and AI interviewer improvements.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/15 glass-panel p-6">
      <CardHeader className="p-0 mb-4 text-center">
        <CardTitle className="text-lg text-white">Help Validate InterviewAI</CardTitle>
        <CardDescription className="text-xs text-slate-400">
          We are collecting real candidate feedback to measure product usefulness and realism.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Was the interview useful? */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-200 block text-center">
            1. Was this mock interview useful?
          </label>
          <div className="flex justify-center gap-3">
            <Button
              type="button"
              variant={isUseful === true ? "default" : "outline"}
              size="sm"
              onClick={() => setIsUseful(true)}
              className={cn("gap-2 text-xs", isUseful === true && "bg-emerald-600 hover:bg-emerald-700")}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              👍 Yes, useful
            </Button>
            <Button
              type="button"
              variant={isUseful === false ? "destructive" : "outline"}
              size="sm"
              onClick={() => setIsUseful(false)}
              className="gap-2 text-xs"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              👎 Needs improvement
            </Button>
          </div>
        </div>

        {/* 2. Was the AI interviewer realistic? */}
        <div className="space-y-1.5 flex flex-col items-center">
          <label className="text-xs text-slate-300">
            2. How realistic did the AI avatar conversation feel? (1-5)
          </label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRealismRating(star)}
                className="p-1 text-slate-400 hover:text-amber-400 focus:outline-none transition-colors"
                aria-label={`Rate realism ${star} stars`}
              >
                <Star
                  className={cn(
                    "w-5 h-5",
                    star <= realismRating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 3. Would you use this again? */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-200 block text-center">
            3. Would you use InterviewAI again to practice?
          </label>
          <div className="flex justify-center gap-2">
            {(["yes", "maybe", "no"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setWouldUseAgain(opt)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium border transition-all capitalize",
                  wouldUseAgain === opt
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "border-white/10 text-slate-300 hover:bg-white/5"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* 4. What was confusing? */}
        <div className="space-y-1">
          <label className="text-xs text-slate-300">4. Was anything confusing or unnatural? (Optional)</label>
          <textarea
            value={confusingAspects}
            onChange={(e) => setConfusingAspects(e.target.value)}
            placeholder="e.g. Speech pacing, question wording, transition timing..."
            rows={2}
            className="w-full rounded-xl bg-white/5 border border-white/10 p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 5. What should we improve? */}
        <div className="space-y-1">
          <label className="text-xs text-slate-300">5. What should we improve for the next release? (Optional)</label>
          <textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="e.g. Deeper follow-up questions, video avatar, specific coding challenges..."
            rows={2}
            className="w-full rounded-xl bg-white/5 border border-white/10 p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <Button
          type="submit"
          variant="glow"
          size="sm"
          disabled={isSubmitting}
          className="w-full gap-2 text-xs"
        >
          <Send className="w-3.5 h-3.5" />
          Submit Feedback
        </Button>
      </form>
    </Card>
  );
}
