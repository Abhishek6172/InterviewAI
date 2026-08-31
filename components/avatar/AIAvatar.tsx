"use client";

import React from "react";
import { AvatarState } from "@/types/avatar";
import { AvatarStatusIndicator } from "./AvatarStatusIndicator";
import { AvatarAudioVisualizer } from "./AvatarAudioVisualizer";
import { cn } from "@/lib/utils/cn";
import { Bot, Sparkles, BrainCircuit } from "lucide-react";

export interface AIAvatarProps {
  state: AvatarState;
  interviewerName?: string;
  roleTitle?: string;
  caption?: string;
  className?: string;
}

export function AIAvatar({
  state = "idle",
  interviewerName = "Alex",
  roleTitle = "Senior AI Interviewer",
  caption,
  className,
}: AIAvatarProps) {
  // Determine state-based luxury color styling
  const getStateColors = () => {
    switch (state) {
      case "listening":
        return {
          glow: "shadow-[0_0_55px_rgba(16,185,129,0.3)] border-emerald-500/40 bg-emerald-950/20",
          ring: "border-emerald-400/40 animate-pulse",
          orb: "from-emerald-500/25 via-teal-600/15 to-transparent",
          iconColor: "text-emerald-400",
        };
      case "thinking":
        return {
          glow: "shadow-[0_0_55px_rgba(236,72,153,0.3)] border-rose-500/40 bg-rose-950/20",
          ring: "border-rose-400/40 animate-spin",
          orb: "from-rose-500/25 via-purple-600/20 to-transparent",
          iconColor: "text-rose-400",
        };
      case "speaking":
        return {
          glow: "shadow-[0_0_55px_rgba(245,158,11,0.3)] border-amber-500/40 bg-amber-950/20",
          ring: "border-amber-400/40 animate-pulse-slow",
          orb: "from-amber-500/25 via-orange-600/15 to-transparent",
          iconColor: "text-amber-400",
        };
      case "idle":
      default:
        return {
          glow: "shadow-[0_0_50px_rgba(139,92,246,0.22)] border-purple-500/30 bg-purple-950/15",
          ring: "border-purple-400/30",
          orb: "from-violet-500/25 via-purple-600/15 to-transparent",
          iconColor: "text-purple-300",
        };
    }
  };

  const styleConfig = getStateColors();

  return (
    <div className={cn("flex flex-col items-center justify-center p-6", className)}>
      {/* Outer Glow Halo Container */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Animated Ripple Waves */}
        {(state === "listening" || state === "speaking") && (
          <>
            <div
              className={cn(
                "absolute -inset-6 rounded-full opacity-40 animate-ping duration-1000",
                state === "listening" ? "bg-emerald-500/20" : "bg-amber-500/20"
              )}
            />
            <div
              className={cn(
                "absolute -inset-12 rounded-full opacity-20 animate-pulse duration-700",
                state === "listening" ? "bg-emerald-500/10" : "bg-amber-500/10"
              )}
            />
          </>
        )}

        {/* Orbiting Subtle Ring Indicator */}
        <div
          className={cn(
            "absolute -inset-3 rounded-full border border-dashed transition-all duration-700",
            styleConfig.ring
          )}
          style={{ animationDuration: state === "thinking" ? "4s" : "8s" }}
        />

        {/* Core Avatar Orb */}
        <div
          className={cn(
            "relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border flex flex-col items-center justify-center backdrop-blur-2xl transition-all duration-500 overflow-hidden",
            styleConfig.glow
          )}
        >
          {/* Internal Iridescent Gradient */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-b opacity-80 transition-colors duration-500",
              styleConfig.orb
            )}
          />

          {/* Fine dot matrix overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:10px_10px] opacity-70" />

          {/* Central Animated Face / Icon */}
          <div className="relative z-10 flex flex-col items-center">
            {state === "thinking" ? (
              <BrainCircuit className={cn("w-14 h-14 transition-all duration-300", styleConfig.iconColor)} />
            ) : state === "listening" ? (
              <Sparkles className={cn("w-14 h-14 transition-all duration-300 animate-pulse", styleConfig.iconColor)} />
            ) : (
              <Bot className={cn("w-14 h-14 transition-all duration-300", styleConfig.iconColor)} />
            )}

            {/* Micro Audio Visualizer inside the avatar orb */}
            <div className="mt-2">
              <AvatarAudioVisualizer state={state} />
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Persona Identity */}
      <div className="text-center space-y-1.5 mb-3">
        <h2 className="text-lg font-semibold text-white tracking-tight flex items-center justify-center gap-2">
          {interviewerName}
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
            AI Interviewer
          </span>
        </h2>
        <p className="text-xs text-muted-foreground">{roleTitle}</p>
      </div>

      {/* State Status Indicator Pill */}
      <AvatarStatusIndicator state={state} />

      {/* Optional Speech Caption */}
      {caption && (
        <div className="mt-4 max-w-xl text-center px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-slate-200 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 shadow-lg">
          &ldquo;{caption}&rdquo;
        </div>
      )}
    </div>
  );
}
