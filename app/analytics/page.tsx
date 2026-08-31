"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import { ValidationFeedback, AnalyticsEvent } from "@/types/analytics";
import {
  BarChart3,
  Users,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Star,
  ChevronLeft,
  RefreshCw,
  Clock,
  User,
  Volume2,
  BrainCircuit,
  Heart,
  Sparkles,
} from "lucide-react";

export default function AnalyticsDashboardPage() {
  const [funnel, setFunnel] = useState<any>({
    landingViews: 0,
    setupsStarted: 0,
    interviewsStarted: 0,
    questionsAnswered: 0,
    interviewsCompleted: 0,
    retriesClicked: 0,
    completionRate: 0,
  });

  const [feedbacks, setFeedbacks] = useState<ValidationFeedback[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  const loadData = () => {
    const stats = AnalyticsTracker.getFunnelStats();
    setFunnel(stats);
    setFeedbacks(AnalyticsTracker.getStoredFeedback());
    setEvents(AnalyticsTracker.getStoredEvents());
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalFeedbacks = feedbacks.length;
  const avgOverall = totalFeedbacks
    ? (feedbacks.reduce((a, b) => a + (b.overallExperience || b.realismRating || 5), 0) / totalFeedbacks).toFixed(1)
    : "N/A";
  const avgRealism = totalFeedbacks
    ? (feedbacks.reduce((a, b) => a + (b.aiRealism || b.realismRating || 5), 0) / totalFeedbacks).toFixed(1)
    : "N/A";
  const avgAudio = totalFeedbacks
    ? (feedbacks.reduce((a, b) => a + (b.audioExperience || 5), 0) / totalFeedbacks).toFixed(1)
    : "N/A";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 text-slate-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-2 text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Metrics
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="purple" className="text-xs">
            Product Telemetry & Validation
          </Badge>
          <span className="text-xs text-muted-foreground">Real-Time Client, API & Google Form Store</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Live Traction & Feedback Insights
        </h1>
        <p className="text-sm text-slate-400">
          Raw event telemetry and real user validation responses collected from actual candidate sessions.
        </p>
      </div>

      {/* Funnel Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 glass-panel text-center">
          <span className="text-[11px] text-muted-foreground block mb-1">Landing Views</span>
          <span className="text-2xl font-bold text-white">{funnel.landingViews}</span>
        </Card>

        <Card className="p-4 glass-panel text-center">
          <span className="text-[11px] text-muted-foreground block mb-1">Setups Started</span>
          <span className="text-2xl font-bold text-blue-400">{funnel.setupsStarted}</span>
        </Card>

        <Card className="p-4 glass-panel text-center">
          <span className="text-[11px] text-muted-foreground block mb-1">Interviews Started</span>
          <span className="text-2xl font-bold text-indigo-400">{funnel.interviewsStarted}</span>
        </Card>

        <Card className="p-4 glass-panel text-center">
          <span className="text-[11px] text-muted-foreground block mb-1">Questions Answered</span>
          <span className="text-2xl font-bold text-purple-400">{funnel.questionsAnswered}</span>
        </Card>

        <Card className="p-4 glass-panel text-center">
          <span className="text-[11px] text-muted-foreground block mb-1">Completed</span>
          <span className="text-2xl font-bold text-emerald-400">{funnel.interviewsCompleted}</span>
        </Card>

        <Card className="p-4 glass-panel text-center">
          <span className="text-[11px] text-muted-foreground block mb-1">Completion Rate</span>
          <span className="text-2xl font-bold text-emerald-400">
            {funnel.completionRate ? `${funnel.completionRate.toFixed(0)}%` : "0%"}
          </span>
        </Card>
      </div>

      {/* Validation Feedback Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 glass-panel flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block">Total Feedbacks</span>
            <span className="text-2xl font-bold text-white">{totalFeedbacks}</span>
          </div>
          <Users className="w-7 h-7 text-blue-400/50" />
        </Card>

        <Card className="p-5 glass-panel flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block">Overall Experience</span>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-amber-400">{avgOverall}</span>
              <span className="text-xs text-slate-400">/ 5</span>
            </div>
          </div>
          <Star className="w-7 h-7 text-amber-400/50" />
        </Card>

        <Card className="p-5 glass-panel flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block">Adya AI Realism</span>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-purple-400">{avgRealism}</span>
              <span className="text-xs text-slate-400">/ 5</span>
            </div>
          </div>
          <BrainCircuit className="w-7 h-7 text-purple-400/50" />
        </Card>

        <Card className="p-5 glass-panel flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block">Voice & Audio</span>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-emerald-400">{avgAudio}</span>
              <span className="text-xs text-slate-400">/ 5</span>
            </div>
          </div>
          <Volume2 className="w-7 h-7 text-emerald-400/50" />
        </Card>
      </div>

      {/* Qualitative Feedback Records Table */}
      <Card className="glass-panel border-white/10 p-6 space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Candidate Feedback Log ({totalFeedbacks})
          </CardTitle>
        </CardHeader>

        {totalFeedbacks === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <p>No feedback submissions collected yet.</p>
            <p className="text-slate-500">
              Complete a mock interview at <Link href="/interview/setup" className="text-purple-400 underline">/interview/setup</Link> and submit feedback to populate this table.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((fb, idx) => (
              <div
                key={fb.id || idx}
                className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      {fb.name || "Anonymous Candidate"}
                    </span>
                    <Badge variant="purple" className="text-[10px]">
                      ⭐ {fb.overallExperience || fb.realismRating || 5}/5
                    </Badge>
                    {fb.email && <span className="text-[11px] text-slate-400">({fb.email})</span>}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(fb.submittedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {fb.likedMost && (
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-400 block mb-0.5 flex items-center gap-1">
                        <Heart className="w-3 h-3" /> Liked Most:
                      </span>
                      <p className="text-slate-200 leading-relaxed italic">&ldquo;{fb.likedMost}&rdquo;</p>
                    </div>
                  )}

                  {fb.improvementSuggestions && (
                    <div>
                      <span className="text-[11px] font-semibold text-purple-400 block mb-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Suggested Improvements:
                      </span>
                      <p className="text-slate-200 leading-relaxed italic">&ldquo;{fb.improvementSuggestions}&rdquo;</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
