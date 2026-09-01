"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AIAvatar } from "@/components/avatar/AIAvatar";
import { AvatarState } from "@/types/avatar";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import { UserMenu } from "@/components/auth/UserMenu";
import { SignInModal } from "@/components/auth/SignInModal";
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
  User,
} from "lucide-react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [demoState, setDemoState] = useState<AvatarState>("idle");
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    AnalyticsTracker.track("landing_view");
  }, []);

  const handleStartClick = (e: React.MouseEvent) => {
    if (!session || !session.user) {
      e.preventDefault();
      setShowAuthModal(true);
    } else {
      router.push("/interview/setup");
    }
  };

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  const user = session?.user;
  const firstName = user?.name ? user.name.split(" ")[0] : null;

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
          <UserMenu onSignInRequired={() => setShowAuthModal(true)} />
          <Button
            variant="glow"
            size="sm"
            onClick={handleStartClick}
            className="gap-1 sm:gap-1.5 text-xs px-3 sm:px-4 cursor-pointer"
          >
            <span>Start</span>
            <span className="hidden sm:inline">Interview</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl text-center space-y-4 sm:space-y-6 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-medium text-purple-300">
          <Zap className="w-3.5 h-3.5" />
          Adaptive AI Mock Interview Platform
        </div>

        {firstName ? (
          <div className="inline-block px-4 py-1.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs sm:text-sm font-bold text-purple-300 mb-2">
            👋 Welcome back, {firstName}!
          </div>
        ) : null}

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
          Practice interviews with{" "}
          <span className="bg-gradient-to-r from-purple-400 via-rose-300 to-indigo-300 bg-clip-text text-transparent">
            Sara AI.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-normal px-2">
          Meet Sara &mdash; your realistic AI interviewer who adapts to your answers, probes your resume projects,
          and delivers structured performance feedback.
        </p>

        {/* Primary and Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            variant="glow"
            onClick={handleStartClick}
            className="w-full sm:w-auto gap-2.5 text-sm sm:text-base px-8 h-12 sm:h-13 shadow-xl cursor-pointer"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Start Mock Interview
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToHowItWorks}
            className="w-full sm:w-auto text-sm sm:text-base px-6 h-12 sm:h-13 border-white/10 hover:border-white/20 text-slate-300 hover:text-white"
          >
            How Sara Works
          </Button>
        </div>

        {/* Real-time Status Badge */}
        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Natural Voice Synthesis &bull; Resume Deep-Dive &bull; Instant Evaluation</span>
        </div>
      </section>

      {/* Interactive Avatar Showcase */}
      <section className="w-full max-w-4xl mb-16 sm:mb-24">
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-10 flex flex-col items-center space-y-6 relative overflow-hidden">
          <div className="text-center space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-white">Live AI Interviewer Avatar</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Sara reacts dynamically in real-time as you speak and submit answers.
            </p>
          </div>

          <AIAvatar
            state={demoState}
            interviewerName="Sara"
            roleTitle="Senior Technical Interviewer"
            className="p-4"
          />

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-muted-foreground mr-2 font-medium">Test Sara&apos;s States:</span>
            {(["idle", "listening", "thinking", "speaking"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setDemoState(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  demoState === st
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-105"
                    : "bg-white/5 hover:bg-white/10 text-slate-300"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="how-it-works" className="w-full max-w-5xl space-y-8 mb-16">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Engineered for Realistic Practice
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to master your interview performance with state-of-the-art AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-panel border-white/10 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Dynamic AI Persona &bull; Sara</h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Experience responsive, adaptive questions with lifelike facial animations and synchronized natural speech.
            </p>
          </Card>

          <Card className="glass-panel border-white/10 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Resume & Role Tailoring</h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Upload your PDF resume or select from Software Engineering, Frontend, Backend, or Product roles to customize question depth.
            </p>
          </Card>

          <Card className="glass-panel border-white/10 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">5-Dimensional Scorecard</h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Receive immediate scoring across Communication, Technical Depth, Relevance, Clarity, and Confidence with clear improvement tips.
            </p>
          </Card>
        </div>
      </section>

      {/* Bottom Launch Banner */}
      <section className="w-full max-w-4xl glass-panel-glow rounded-3xl p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Ready to ace your next technical round?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          Start your 5-minute mock interview session with Sara AI now.
        </p>
        <div className="pt-2">
          <Button
            size="lg"
            variant="glow"
            onClick={handleStartClick}
            className="gap-2 px-8 h-12 shadow-xl cursor-pointer"
          >
            Launch Interview Session
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Mandatory Sign In Modal Popup */}
      <SignInModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
