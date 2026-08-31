"use client";

import React from "react";
import { InterviewQuestion } from "@/types/interview";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Volume2, Lightbulb } from "lucide-react";

interface QuestionCardProps {
  question: InterviewQuestion;
  onReplayAudio?: () => void;
  isSpeaking?: boolean;
}

export function QuestionCard({
  question,
  onReplayAudio,
  isSpeaking = false,
}: QuestionCardProps) {
  return (
    <Card className="w-full max-w-2xl border-white/10 glass-panel-glow text-center p-6 transition-all duration-300">
      <CardContent className="p-0 space-y-4">
        {/* Category tag */}
        <div className="flex items-center justify-center gap-2">
          <Badge variant="purple" className="capitalize text-xs tracking-wider">
            {question.category} Question
          </Badge>
          {question.isFollowUp && (
            <Badge variant="warning" className="text-xs">
              Contextual Follow-up
            </Badge>
          )}
        </div>

        {/* The Question Text */}
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-relaxed">
          &ldquo;{question.question}&rdquo;
        </h1>

        {/* Audio Replay & Context Hint */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onReplayAudio && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReplayAudio}
              disabled={isSpeaking}
              className="gap-2 text-xs border-white/10 hover:border-white/20 text-slate-300"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              {isSpeaking ? "Interviewer Speaking..." : "Replay Question Audio"}
            </Button>
          )}

          {question.contextHint && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Hint: {question.contextHint}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
