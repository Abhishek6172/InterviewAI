"use client";

import React from "react";
import { AvatarState } from "@/types/avatar";
import { Badge } from "@/components/ui/Badge";
import { Mic, Sparkles, Volume2, Pause } from "lucide-react";

export function AvatarStatusIndicator({ state }: { state: AvatarState }) {
  switch (state) {
    case "listening":
      return (
        <Badge variant="success" className="gap-1.5 px-3 py-1 text-xs font-medium animate-pulse">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Mic className="w-3.5 h-3.5" />
          AI is listening to your answer...
        </Badge>
      );
    case "thinking":
      return (
        <Badge variant="purple" className="gap-1.5 px-3 py-1 text-xs font-medium animate-pulse">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-300" />
          AI is analyzing & formulating follow-up...
        </Badge>
      );
    case "speaking":
      return (
        <Badge variant="warning" className="gap-1.5 px-3 py-1 text-xs font-medium">
          <Volume2 className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
          AI Interviewer is speaking...
        </Badge>
      );
    case "idle":
    default:
      return (
        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium text-slate-300">
          <Pause className="w-3 h-3 text-slate-400" />
          Ready for your response
        </Badge>
      );
  }
}
