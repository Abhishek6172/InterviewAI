"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Sparkles, ShieldCheck, BrainCircuit, Award, ArrowRight } from "lucide-react";

interface SignInModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
}

export function SignInModal({
  isOpen,
  onClose,
  title = "Sign In to Practice with Sara",
  description = "Sign in with Google to configure your mock interview, speak with Sara AI in real-time, and get your evaluated performance scorecard.",
}: SignInModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#131627] to-[#0a0c16] border border-purple-500/30 p-6 sm:p-8 shadow-2xl shadow-purple-500/20 space-y-6 text-center">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Brand & Avatar icon */}
        <div className="relative z-10 flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30 border border-purple-400/30">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs text-purple-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            Candidate Authentication Required
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5 text-left text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Interactive real-time voice interview with <strong>Sara</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>5-dimensional scoring & customized improvement tips</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Fast, 1-click Google OAuth verification</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <div className="relative z-10 space-y-3">
          <Button
            type="button"
            variant="glow"
            size="lg"
            onClick={() => signIn("google")}
            className="w-full gap-3 h-12 text-sm sm:text-base font-bold shadow-xl cursor-pointer"
          >
            {/* Google G SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </Button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Maybe later &bull; Return to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
