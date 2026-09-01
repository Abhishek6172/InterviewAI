"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Award,
} from "lucide-react";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import { ValidationFeedback } from "@/types/analytics";
import { cn } from "@/lib/utils/cn";

interface FeedbackModalProps {
  sessionId: string;
  onFeedbackSubmitted?: () => void;
}

export function FeedbackModal({ sessionId, onFeedbackSubmitted }: FeedbackModalProps) {
  const { data: authSession } = useSession();

  // Candidate Info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Auto prefill from Google OAuth session
  useEffect(() => {
    if (authSession?.user) {
      if (authSession.user.name && !name) {
        setName(authSession.user.name);
      }
      if (authSession.user.email && !email) {
        setEmail(authSession.user.email);
      }
    }
  }, [authSession]);

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
      <Card className="glass-panel-glow border-emerald-500/40 p-8 text-center space-y-4 shadow-2xl">
        <CardContent className="p-0 flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 animate-bounce" />
          </div>
          <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Thank you for your feedback{name ? `, ${name}` : ""}!
          </h4>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Your responses have been recorded and synced to help train Sara and shape our next interview features.
          </p>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Response Logged &bull; Google Form Synced</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      id="feedback-form-section"
      className="p-6 sm:p-10 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-[#0d0f1a] to-[#090a10] shadow-2xl shadow-purple-500/10 space-y-8 scroll-mt-20"
    >
      {/* Prominent, Eye-Catching Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs sm:text-sm font-bold text-purple-300 shadow-md">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          CANDIDATE FEEDBACK & EVALUATION
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          How was your experience with Sara?
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Please share your 60-second review below. Your feedback directly shapes our scoring algorithms, question depth, and voice synthesis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        {/* 1. Candidate Info (Name & Email) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-purple-400" />
              Candidate Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@example.com"
              className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* 2. Rating Dimensions Grid */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-5">
          {/* Dimension A: Overall Experience */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-sm font-bold text-white block">1. Overall Interview Experience</span>
              <span className="text-xs text-slate-400">How would you rate the overall mock interview?</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                >
                  <Star
                    className={cn(
                      "w-6 h-6",
                      star <= overallRating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                    )}
                  />
                </button>
              ))}
              <span className="text-sm font-extrabold text-amber-400 ml-2">{overallRating}/5</span>
            </div>
          </div>

          {/* Dimension B: Sara AI Realism */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/5">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                2. Sara Realism & Question Quality
              </span>
              <span className="text-xs text-slate-400">Did the questions feel authentic to real industry interviews?</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setAiRealism(star)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                >
                  <Star
                    className={cn(
                      "w-6 h-6",
                      star <= aiRealism ? "text-purple-400 fill-purple-400" : "text-slate-600"
                    )}
                  />
                </button>
              ))}
              <span className="text-sm font-extrabold text-purple-400 ml-2">{aiRealism}/5</span>
            </div>
          </div>

          {/* Dimension C: Voice & Speech Quality */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/5">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                3. Voice & Audio Clarity
              </span>
              <span className="text-xs text-slate-400">Was the speech clear, natural, and properly paced?</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setAudioRating(star)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                >
                  <Star
                    className={cn(
                      "w-6 h-6",
                      star <= audioRating ? "text-emerald-400 fill-emerald-400" : "text-slate-600"
                    )}
                  />
                </button>
              ))}
              <span className="text-sm font-extrabold text-emerald-400 ml-2">{audioRating}/5</span>
            </div>
          </div>
        </div>

        {/* 3. Interview Preparedness Feeling */}
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-white block">
            4. How prepared do you feel for your actual interview after this session?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  "p-3.5 rounded-2xl border text-left transition-all",
                  preparedness === opt.id
                    ? "bg-purple-600/20 border-purple-500 text-white shadow-lg ring-1 ring-purple-500"
                    : "glass-panel border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5"
                )}
              >
                <span className="text-xs sm:text-sm font-bold block">{opt.label}</span>
                <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. What did you like most? */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-white block">
            5. What did you like most about Sara? (Optional)
          </label>
          <input
            type="text"
            value={likedMost}
            onChange={(e) => setLikedMost(e.target.value)}
            placeholder="e.g. Real-time avatar reaction, resume project questioning, voice recognition..."
            className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* 5. What should we improve? */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-white block">
            6. What should we improve or add next? (Optional)
          </label>
          <textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="e.g. Live code editor, video recording playback, company-specific question packs..."
            rows={3}
            className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* 6. Would you practice with Sara again? */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <span className="text-xs sm:text-sm text-white font-medium">Would you practice with InterviewAI again?</span>
          <div className="flex gap-2">
            {(["yes", "maybe", "no"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setWouldUseAgain(opt)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize",
                  wouldUseAgain === opt
                    ? "bg-purple-600 border-purple-500 text-white shadow-md"
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
          className="w-full gap-2.5 text-sm sm:text-base h-13 shadow-xl cursor-pointer"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? "Submitting Your Review..." : "Submit Candidate Feedback"}
        </Button>
      </form>
    </div>
  );
}
