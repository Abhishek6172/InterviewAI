"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SessionManager } from "@/lib/interview/session-manager";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import {
  User,
  Mail,
  Award,
  Calendar,
  Sparkles,
  RotateCcw,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Target,
  ArrowRight,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load local practice sessions
    const active = SessionManager.getActiveSession();
    if (active) {
      setInterviewHistory([active]);
    }
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Sign in to your Profile</h1>
          <p className="text-sm text-slate-400">
            Sign in with Google to sync your mock interview scorecards, track performance metrics, and prefill candidate applications.
          </p>
        </div>
        <Button
          type="button"
          variant="glow"
          size="lg"
          onClick={() => signIn("google")}
          className="gap-3 shadow-xl"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
      </div>
    );
  }

  const user = session.user;
  const activeSession = interviewHistory[0];
  const lastScore = activeSession?.scorecard?.overallScore || 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "Candidate"}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-purple-500/40 shadow-xl"
              />
            ) : (
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-purple-600/30 text-purple-300 font-extrabold text-2xl flex items-center justify-center border-2 border-purple-500/40">
                {user.name?.slice(0, 2).toUpperCase() || "CA"}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{user.name}</h1>
                <Badge variant="success" className="text-[10px] gap-1 py-0.5">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" /> {user.email}
              </p>
              <p className="text-[11px] text-slate-500">Google OAuth Account</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/interview/setup">
              <Button variant="glow" size="sm" className="gap-2 text-xs">
                <RotateCcw className="w-3.5 h-3.5" />
                Practice Interview
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="gap-1.5 text-xs text-rose-400 border-rose-500/20 hover:bg-rose-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Recent Mock Score</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {lastScore > 0 ? `${lastScore}/100` : "Ready"}
          </p>
          <p className="text-[11px] text-slate-500">
            {lastScore > 0 ? "Latest session performance" : "Start a session to calculate score"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Target Role</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-base sm:text-lg font-bold text-white truncate">
            {activeSession?.options?.role || "Software Engineer"}
          </p>
          <p className="text-[11px] text-slate-500">
            {activeSession?.options?.difficulty || "Medium"} &bull; {activeSession?.options?.experienceLevel || "Fresher"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Interviewer</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-base sm:text-lg font-bold text-white">Sara AI</p>
          <p className="text-[11px] text-slate-500">Real-time voice & scorecard</p>
        </div>
      </div>

      {/* Recent Session / Scorecard */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Recent Practice Sessions
        </h2>

        {activeSession ? (
          <Card className="glass-panel border-white/10 p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    {activeSession.options.role}
                  </span>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {activeSession.options.difficulty}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  {activeSession.questions.length} questions &bull; Completed {new Date(activeSession.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {activeSession.scorecard && (
                  <span className="text-sm font-extrabold px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {activeSession.scorecard.overallScore}/100
                  </span>
                )}
                <Link href="/interview/results">
                  <Button variant="glow" size="sm" className="text-xs gap-1.5">
                    View Scorecard <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="glass-panel border-white/10 p-8 text-center space-y-3">
            <p className="text-sm text-slate-400">No mock interview sessions recorded yet.</p>
            <Link href="/interview/setup">
              <Button variant="glow" size="sm">Start Your First Interview with Sara</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
