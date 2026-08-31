"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sparkles, XCircle } from "lucide-react";
import Link from "next/link";

interface InterviewHeaderProps {
  role: string;
  difficulty: string;
  currentQuestion: number;
  totalQuestions: number;
  onEndInterview?: () => void;
}

export function InterviewHeader({
  role,
  difficulty,
  currentQuestion,
  totalQuestions,
  onEndInterview,
}: InterviewHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between py-4 px-6 border-b border-white/10 glass-panel">
      {/* Brand & Role */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight hidden sm:inline">
            Interview<span className="text-blue-400">AI</span>
          </span>
        </Link>

        <div className="h-4 w-px bg-white/15 mx-1 hidden sm:block" />

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal text-xs text-slate-300">
            {role}
          </Badge>
          <Badge variant="outline" className="capitalize text-xs text-slate-400">
            {difficulty}
          </Badge>
        </div>
      </div>

      {/* Progress & Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="text-xs text-muted-foreground block">Session Progress</span>
          <span className="text-sm font-semibold text-white">
            Question {currentQuestion} <span className="text-slate-500">/ {totalQuestions}</span>
          </span>
        </div>

        {onEndInterview ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEndInterview}
            className="text-slate-400 hover:text-red-400 hover:bg-red-950/30"
          >
            <XCircle className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Quit Session</span>
          </Button>
        ) : (
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400">
              Exit
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
