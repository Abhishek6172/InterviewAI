"use client";

import React from "react";
import { InterviewScorecard } from "@/types/interview";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { CheckCircle2, AlertCircle, ArrowUpRight, Target } from "lucide-react";

export function RecommendationList({ scorecard }: { scorecard: InterviewScorecard }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* 1. Your Strengths (3-5 Points) */}
      <Card className="border-emerald-500/20 glass-panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            Your Strengths ({scorecard.strengths?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {scorecard.strengths && scorecard.strengths.length > 0 ? (
            scorecard.strengths.map((st, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{st}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No specific strengths recorded.</p>
          )}
        </CardContent>
      </Card>

      {/* 2. Areas to Improve (3-5 Points) */}
      <Card className="border-amber-500/20 glass-panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-amber-400">
            <AlertCircle className="w-5 h-5" />
            Areas to Improve ({scorecard.areasToImprove?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {scorecard.areasToImprove && scorecard.areasToImprove.length > 0 ? (
            scorecard.areasToImprove.map((imp, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{imp}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No specific improvements recorded.</p>
          )}
        </CardContent>
      </Card>

      {/* 3. Suggested Next Steps */}
      <Card className="md:col-span-2 border-blue-500/20 glass-panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-blue-400">
            <Target className="w-5 h-5" />
            Suggested Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {scorecard.suggestedNextSteps && scorecard.suggestedNextSteps.length > 0 ? (
            scorecard.suggestedNextSteps.map((rec, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200 leading-relaxed flex flex-col justify-between"
              >
                <div>
                  <span className="font-semibold text-blue-400 block mb-1">Step {i + 1}</span>
                  {rec}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No recommendations generated.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
