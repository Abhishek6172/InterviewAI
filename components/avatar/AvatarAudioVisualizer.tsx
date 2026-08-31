"use client";

import React from "react";
import { AvatarState } from "@/types/avatar";
import { cn } from "@/lib/utils/cn";

export function AvatarAudioVisualizer({
  state,
  className,
}: {
  state: AvatarState;
  className?: string;
}) {
  const getBarColor = () => {
    switch (state) {
      case "listening":
        return "bg-emerald-400";
      case "speaking":
        return "bg-amber-400";
      case "thinking":
        return "bg-purple-400";
      default:
        return "bg-blue-400/50";
    }
  };

  const barCount = 12;

  return (
    <div className={cn("flex items-center justify-center gap-1 h-8", className)}>
      {Array.from({ length: barCount }).map((_, i) => {
        const isActive = state === "listening" || state === "speaking";
        const delay = (i * 0.1).toFixed(1);
        return (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full transition-all duration-200",
              getBarColor(),
              isActive ? "animate-pulse" : "h-1.5 opacity-40"
            )}
            style={{
              height: isActive ? `${Math.max(6, Math.sin(i + 1) * 24 + 10)}px` : "4px",
              animationDelay: `${delay}s`,
              animationDuration: state === "speaking" ? "0.6s" : "1.2s",
            }}
          />
        );
      })}
    </div>
  );
}
