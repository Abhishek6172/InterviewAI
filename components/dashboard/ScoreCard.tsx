"use client";

import React from "react";
import { InterviewScorecard } from "@/types/interview";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Award, MessageSquare, Code2, Target, Eye, ShieldCheck } from "lucide-react";

export function ScoreCard({ scorecard }: { scorecard: InterviewScorecard }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return "Exceptional Readiness";
    if (score >= 75) return "Strong Candidate";
    if (score >= 60) return "Solid Foundation";
    return "Needs Targeted Practice";
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Level Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Score Highlight */}
        <Card glow className="p-6 flex flex-col items-center justify-center text-center border-blue-500/30">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
            <Award className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Score</span>
          <div className="flex items-baseline gap-1 my-1">
            <span className={`text-5xl font-extrabold ${getScoreColor(scorecard.overallScore)}`}>
              {scorecard.overallScore}
            </span>
            <span className="text-sm text-slate-500 font-semibold">/100</span>
          </div>
          <span className="text-xs font-medium text-blue-300">
            {getScoreLabel(scorecard.overallScore)}
          </span>
        </Card>

        {/* Executive Feedback Quote */}
        <Card className="md:col-span-2 p-6 flex flex-col justify-center glass-panel">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
            AI Interviewer Synthesis
          </span>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal italic">
            &ldquo;{scorecard.executiveSummary}&rdquo;
          </p>
        </Card>
      </div>

      {/* 5-Dimensional Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Communication */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-white">Communication</span>
            </div>
            <span className="text-xs font-bold text-blue-400">{scorecard.communicationScore}/10</span>
          </div>
          <Progress value={scorecard.communicationScore * 10} />
          <span className="text-[10px] text-muted-foreground mt-2">Articulation & pacing</span>
        </Card>

        {/* Technical Accuracy */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-white">Technical Depth</span>
            </div>
            <span className="text-xs font-bold text-indigo-400">{scorecard.technicalScore}/10</span>
          </div>
          <Progress value={scorecard.technicalScore * 10} />
          <span className="text-[10px] text-muted-foreground mt-2">Accuracy & trade-offs</span>
        </Card>

        {/* Relevance */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-white">Relevance</span>
            </div>
            <span className="text-xs font-bold text-purple-400">{scorecard.relevanceScore}/10</span>
          </div>
          <Progress value={scorecard.relevanceScore * 10} />
          <span className="text-[10px] text-muted-foreground mt-2">Directness to prompt</span>
        </Card>

        {/* Clarity */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-white">Clarity</span>
            </div>
            <span className="text-xs font-bold text-emerald-400">{scorecard.clarityScore}/10</span>
          </div>
          <Progress value={scorecard.clarityScore * 10} />
          <span className="text-[10px] text-muted-foreground mt-2">Structure & flow</span>
        </Card>

        {/* Confidence / Completeness */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-white">Confidence</span>
            </div>
            <span className="text-xs font-bold text-amber-400">{scorecard.confidenceScore}/10</span>
          </div>
          <Progress value={scorecard.confidenceScore * 10} />
          <span className="text-[10px] text-muted-foreground mt-2">Edge cases & metrics</span>
        </Card>
      </div>
    </div>
  );
}
