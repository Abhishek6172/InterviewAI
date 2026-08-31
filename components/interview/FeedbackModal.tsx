"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ThumbsUp,
  ThumbsDown,
  Star,
  Send,
  CheckCircle2,
  User,
  Mail,
  Sparkles,
  Volume2,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import { ValidationFeedback } from "@/types/analytics";
import { cn } from "@/lib/utils/cn";

interface FeedbackModalProps {
  sessionId: string;
  onFeedbackSubmitted?: () => void;
}

export function FeedbackModal({ sessionId, onFeedbackSubmitted }: FeedbackModalProps) {
  // Candidate Info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Detailed Ratings (1-5)
  const [overallRating, setOverallRating] = useState<number>(5);
  const [aiRealism, setAiRealism] = useState<number>(5);
  const [audioRating, setAudioRating] = useState<number>(5);
  const [preparedness, setPreparedness] = useState<string>("much_more_prepared");
  const [wouldUseAgain, setWouldUseAgain] = useState<"yes" | "maybe" | "no" | null>("yes");

  // Qualitative Insights
  const [likedMost, setLikedMost] = useState("");
  const [improvements, setImprovements] = useState("");
  const [confusingAspects, setConfusingAspects] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncedToGoogle, setSyncedToGoogle] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedbackData: ValidationFeedback = {
      id: `fb_${Date.now()}`,
      sessionId,
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      isUseful: overallRating >= 3,
      overallExperience: overallRating,
      aiRealism,
      audioExperience: audioRating,
      rolePreparedness: preparedness,
      wouldUseAgain,
      likedMost: likedMost.trim() || undefined,
      confusingAspects: confusingAspects.trim() || undefined,
      improvementSuggestions: improvements.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };

    // Save locally to Analytics Tracker
    AnalyticsTracker.saveFeedback(feedbackData);
    AnalyticsTracker.track("feedback_submitted", feedbackData as any, sessionId);

    // Send to backend API (which automatically syncs with Google Form)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      });

      const resData = await res.json();
      if (resData?.googleFormSynced) {
        setSyncedToGoogle(true);
      }
    } catch (err) {
      console.warn("Feedback API offline, saved locally:", err);
    }

    setIsSubmitting(false);
    setSubmitted(true);
    onFeedbackSubmitted?.();
  };

  if (submitted) {
    return (
      <Card className="glass-panel-glow border-emerald-500/30 p-6 sm:p-8 text-center space-y-4">
        <CardContent className="p-0 flex flex-col items-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 animate-bounce" />
          </div>
          <h4 className="text-lg font-bold text-white tracking-tight">
            Thank you for your feedback{name ? `, ${name}` : ""}!
          </h4>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Your responses have been recorded and synced to help train Sara and shape our next interview features.
          </p>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Response recorded &bull; Google Form Ready</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/15 glass-panel p-5 sm:p-7 space-y-6">
      <CardHeader className="p-0 text-center space-y-1">
        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 mx-auto">
          <MessageSquare className="w-3 h-3" />
          Candidate Feedback & Evaluation
        </div>
        <CardTitle className="text-lg sm:text-xl font-bold text-white">
          How was your experience with Sara?
        </CardTitle>
        <CardDescription className="text-xs text-slate-400 max-w-md mx-auto">
          Your feedback directly informs our scoring accuracy, voice models, and new domain questions.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Candidate Info (Name & Email) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Abhishek Kumar"
              className="w-full rounded-xl bg-white/5 border border-white/10 p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. abhishek@example.com"
              className="w-full rounded-xl bg-white/5 border border-white/10 p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* 2. Rating Dimensions Grid */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          {/* Dimension A: Overall Experience */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-white block">1. Overall Interview Experience</span>
              <span className="text-[11px] text-slate-400">How would you rate the overall mock interview?</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-5 h-5",
                      star <= overallRating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                    )}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-amber-400 ml-1.5">{overallRating}/5</span>
            </div>
          </div>

          {/* Dimension B: Sara AI Realism */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-white/5">
            <div>
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                2. Sara Realism & Question Quality
              </span>
              <span className="text-[11px] text-slate-400">Did the questions feel authentic to real industry interviews?</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setAiRealism(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-5 h-5",
                      star <= aiRealism ? "text-purple-400 fill-purple-400" : "text-slate-600"
                    )}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-purple-400 ml-1.5">{aiRealism}/5</span>
            </div>
          </div>

          {/* Dimension C: Voice & Speech Quality */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-white/5">
            <div>
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                3. Voice & Audio Clarity
              </span>
              <span className="text-[11px] text-slate-400">Was the speech clear, natural, and properly paced?</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setAudioRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-5 h-5",
                      star <= audioRating ? "text-emerald-400 fill-emerald-400" : "text-slate-600"
                    )}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-emerald-400 ml-1.5">{audioRating}/5</span>
            </div>
          </div>
        </div>

        {/* 3. Interview Preparedness Feeling */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200 block">
            4. How prepared do you feel for your actual interview after this session?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "much_more_prepared", label: "🚀 Much More Prepared", desc: "Built strong confidence" },
              { id: "somewhat_prepared", label: "👍 Somewhat Prepared", desc: "Good refresher practice" },
              { id: "needs_practice", label: "📚 Need More Practice", desc: "Identified key knowledge gaps" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPreparedness(opt.id)}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all",
                  preparedness === opt.id
                    ? "bg-purple-600/20 border-purple-500 text-white shadow-md ring-1 ring-purple-500"
                    : "glass-panel border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5"
                )}
              >
                <span className="text-xs font-semibold block">{opt.label}</span>
                <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. What did you like most? */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200 block">
            5. What did you like most about Sara? (Optional)
          </label>
          <input
            type="text"
            value={likedMost}
            onChange={(e) => setLikedMost(e.target.value)}
            placeholder="e.g. Real-time avatar reaction, resume project questioning, voice recognition..."
            className="w-full rounded-xl bg-white/5 border border-white/10 p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* 5. What should we improve? */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200 block">
            6. What should we improve or add next? (Optional)
          </label>
          <textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="e.g. Deeper follow-up questions, video avatar, specific coding challenges..."
            rows={2}
            className="w-full rounded-xl bg-white/5 border border-white/10 p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* 6. Would you practice with Sara again? */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10">
          <span className="text-xs text-slate-300 font-medium">Would you practice with InterviewAI again?</span>
          <div className="flex gap-1.5">
            {(["yes", "maybe", "no"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setWouldUseAgain(opt)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium border transition-all capitalize",
                  wouldUseAgain === opt
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "border-white/10 text-slate-400 hover:bg-white/5"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          variant="glow"
          size="lg"
          disabled={isSubmitting}
          className="w-full gap-2 text-sm h-11 shadow-lg"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? "Submitting Your Feedback..." : "Submit Candidate Feedback"}
        </Button>
      </form>
    </Card>
  );
}
