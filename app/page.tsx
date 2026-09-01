"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AIAvatar } from "@/components/avatar/AIAvatar";
import { AvatarState } from "@/types/avatar";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import { UserMenu } from "@/components/auth/UserMenu";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  Bot,
  Award,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  BrainCircuit,
  BarChart3,
} from "lucide-react";

export default function LandingPage() {
  const [demoState, setDemoState] = useState<AvatarState>("idle");

  useEffect(() => {
    AnalyticsTracker.track("landing_view");
  }, []);

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-3 sm:px-6 lg:px-8 py-6 sm:py-10 overflow-x-hidden">
      {/* Top Navigation */}
      <header className="w-full max-w-6xl flex items-center justify-between mb-8 sm:mb-12">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Interview<span className="text-purple-400">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            Sara AI Active
          </div>
          <Link href="/analytics">
            <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white px-2.5 sm:px-3">
              <BarChart3 className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Metrics</span>
            </Button>
          </Link>
          <UserMenu />
          <Link href="/interview/setup">
            <Button variant="glow" size="sm" className="gap-1 sm:gap-1.5 text-xs px-3 sm:px-4">
              <span>Start</span>
              <span className="hidden sm:inline">Interview</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl text-center space-y-4 sm:space-y-6 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-medium text-purple-300">
          <Zap className="w-3.5 h-3.5" />
          Adaptive AI Mock Interview Platform
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
          Practice interviews with{" "}
          <span className="bg-gradient-to-r from-purple-400 via-rose-300 to-indigo-300 bg-clip-text text-transparent">
            Sara AI.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-normal px-2">
          Meet Sara — your realistic AI interviewer who adapts to your answers, probes your resume projects,
          and delivers structured performance feedback.
        </p>

        {/* Primary and Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/interview/setup" className="w-full sm:w-auto">
            <Button size="lg" variant="glow" className="w-full sm:w-auto gap-2.5 text-sm sm:text-base px-8 h-12 sm:h-13 shadow-xl">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              Start Mock Interview
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Button
            size="lg"
            variant="outline"
            onClick={scrollToHowItWorks}
            className="w-full sm:w-auto gap-2 text-sm sm:text-base px-6 h-12 sm:h-13 border-white/15 hover:bg-white/5"
          >
            How it works
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        <div className="pt-2 text-[11px] sm:text-xs text-slate-400 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>Powered by AI reasoning &bull; Dynamically generated questions</span>
        </div>
      </section>

      {/* Interactive Avatar Showcase */}
      <section className="w-full max-w-3xl glass-panel-glow rounded-3xl p-4 sm:p-8 mb-16 sm:mb-20 border border-purple-500/25">
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <span>Meet Sara — Your AI Interviewer</span>
          </div>

          <AIAvatar
            state={demoState}
            interviewerName="Sara"
            roleTitle="Senior AI Technical Interviewer"
            caption={
              demoState === "speaking"
                ? "Can you walk me through a challenging technical project you built, and how you approached the key trade-offs?"
                : demoState === "listening"
                ? "Listening to your answer... Speak naturally into your microphone or type your response."
                : demoState === "thinking"
                ? "Evaluating your response across technical accuracy, structure, and communication pacing..."
                : "Ready to begin your session. Click any state button below to preview avatar responses."
            }
          />

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t border-white/10 w-full">
            <span className="text-[11px] sm:text-xs text-slate-400 mr-1 sm:mr-2">Preview States:</span>
            {(["idle", "speaking", "listening", "thinking"] as AvatarState[]).map((st) => (
              <Button
                key={st}
                type="button"
                variant={demoState === st ? "default" : "outline"}
                size="sm"
                onClick={() => setDemoState(st)}
                className="capitalize text-xs h-7 sm:h-8 px-2.5 sm:px-3"
              >
                {st}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Problem vs Solution vs Why Avatar */}
      <section className="w-full max-w-5xl mb-16 sm:mb-20 space-y-8 sm:space-y-12">
        <div className="text-center space-y-2 sm:space-y-3">
          <Badge variant="purple" className="text-xs">
            Product Insight
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Interview practice is easy to do badly.
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-400 max-w-2xl mx-auto px-2">
            Reading static answers in silence creates a false sense of preparation. In a real interview, you must articulate
            thoughts under conversational pressure and respond to unexpected follow-ups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: The Problem */}
          <Card className="p-5 sm:p-6 space-y-3 glass-panel border-red-500/20">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white">The Problem</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Practicing alone in silence fails because candidates lack realistic dialogue, conversational pressure,
              probing follow-ups, and structured evaluation.
            </p>
          </Card>

          {/* Card 2: The Solution */}
          <Card className="p-5 sm:p-6 space-y-3 glass-panel border-purple-500/20">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white">The Solution</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              InterviewAI gives you a realistic AI interviewer that adapts to your answers in real time, questions your
              resume projects, and provides a clear scorecard.
            </p>
          </Card>

          {/* Card 3: Why AI Avatar */}
          <Card className="p-5 sm:p-6 space-y-3 glass-panel border-indigo-500/20">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
              <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white">Why AI Avatar</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instead of reading another list of questions, you practice in a conversational interview environment with
              clear visual and auditory presence.
            </p>
          </Card>
        </div>
      </section>

      {/* How it works 3-Step Process */}
      <section id="how-it-works" className="w-full max-w-5xl mb-16 sm:mb-20 scroll-mt-10">
        <div className="text-center space-y-2 sm:space-y-3 mb-8 sm:mb-12">
          <Badge variant="secondary" className="text-xs text-slate-300">
            Simple 3-Step Workflow
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            From setup to comprehensive scorecard in less than 10 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="p-5 sm:p-6 space-y-3.5 glass-panel border-white/10 relative overflow-hidden">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-base sm:text-lg">
              1
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Choose Role & Resume
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Select your target role, difficulty, and optionally upload your resume so Sara probes your real projects.
            </p>
          </Card>

          <Card className="p-5 sm:p-6 space-y-3.5 glass-panel border-white/10 relative overflow-hidden">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-base sm:text-lg">
              2
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-rose-400" />
              Interview with Sara
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Practice out loud with voice recognition or type your responses. Sara actively listens and asks follow-ups.
            </p>
          </Card>

          <Card className="p-5 sm:p-6 space-y-3.5 glass-panel border-white/10 relative overflow-hidden">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base sm:text-lg">
              3
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Get Actionable Feedback
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Receive your final scorecard across Communication, Technical Depth, Relevance, Clarity, and Confidence with tips.
            </p>
          </Card>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="w-full max-w-5xl rounded-3xl bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-rose-950/60 border border-purple-500/25 p-6 sm:p-12 text-center space-y-4 sm:space-y-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
          Ready to interview with Sara?
        </h2>
        <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto">
          Practice with realistic conversational pressure and build confidence for your dream role.
        </p>
        <Link href="/interview/setup" className="inline-block w-full sm:w-auto">
          <Button size="lg" variant="glow" className="w-full sm:w-auto gap-2 px-8 h-12 text-sm sm:text-base">
            Start a Mock Interview
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
