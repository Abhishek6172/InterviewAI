"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SessionManager } from "@/lib/interview/session-manager";
import { InterviewSession } from "@/types/interview";
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
  Trash2,
  BarChart3,
  FileCheck,
  Clock,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [imageError, setImageError] = useState(false);

  const loadHistory = () => {
    const pastSessions = SessionManager.getSessionHistory();
    setHistory(pastSessions);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this interview session from your history?")) {
      SessionManager.deleteSessionFromHistory(sessionId);
      loadHistory();
    }
  };

  const handleClearAllHistory = () => {
    if (confirm("Are you sure you want to clear all your interview history and scores? This cannot be undone.")) {
      SessionManager.clearAllHistory();
      loadHistory();
    }
  };

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Sign in to View Your Profile</h1>
          <p className="text-sm text-slate-400">
            Sign in with Google to sync your mock interview scorecards, track performance history, and review past AI evaluations.
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

  // Compute aggregated performance statistics
  const totalInterviews = history.length;
  const scoredSessions = history.filter((s) => s.scorecard?.overallScore !== undefined);
  const totalQuestions = history.reduce((acc, s) => acc + (s.questions?.length || 0), 0);

  const averageScore = scoredSessions.length > 0
    ? Math.round(scoredSessions.reduce((acc, s) => acc + (s.scorecard?.overallScore || 0), 0) / scoredSessions.length)
    : 0;

  const highestScore = scoredSessions.length > 0
    ? Math.max(...scoredSessions.map((s) => s.scorecard?.overallScore || 0))
    : 0;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CA";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {user.image && !imageError ? (
              <img
                src={user.image}
                alt=""
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => setImageError(true)}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-purple-500/40 shadow-xl"
              />
            ) : (
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-purple-500/40 shadow-xl shrink-0">
                {initials}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{user.name}</h1>
                <Badge variant="success" className="text-[10px] gap-1 py-0.5">
                  <ShieldCheck className="w-3 h-3" /> Google Verified
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" /> {user.email}
              </p>
              <p className="text-[11px] text-slate-500">InterviewAI Candidate Profile</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/interview/setup">
              <Button variant="glow" size="sm" className="gap-2 text-xs">
                <RotateCcw className="w-3.5 h-3.5" />
                Practice New Interview
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

      {/* 4 Aggregate Metric Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Interviews */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Interviews Taken</span>
            <FileCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {totalInterviews}
          </p>
          <p className="text-[11px] text-slate-500">Total practice rounds</p>
        </div>

        {/* Average Score */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Score</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {averageScore > 0 ? `${averageScore}/100` : "—"}
          </p>
          <p className="text-[11px] text-slate-500">Across all completed sessions</p>
        </div>

        {/* Top Score */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Highest Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {highestScore > 0 ? `${highestScore}/100` : "—"}
          </p>
          <p className="text-[11px] text-slate-500">Personal best performance</p>
        </div>

        {/* Total Questions Answered */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Questions Practiced</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {totalQuestions}
          </p>
          <p className="text-[11px] text-slate-500">Interactive questions</p>
        </div>
      </div>

      {/* Complete Interview History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Saved Interview History & Past Scores
          </h2>

          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllHistory}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All History
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item, idx) => {
              const score = item.scorecard?.overallScore;
              const dateStr = item.createdAt && !isNaN(new Date(item.createdAt).getTime())
                ? new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recent Session";

              // Color code score badge
              let scoreColor = "bg-purple-500/15 text-purple-300 border-purple-500/30";
              if (score !== undefined) {
                if (score >= 80) scoreColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
                else if (score >= 60) scoreColor = "bg-blue-500/15 text-blue-300 border-blue-500/30";
                else scoreColor = "bg-amber-500/15 text-amber-300 border-amber-500/30";
              }

              return (
                <Card
                  key={item.id || idx}
                  className="glass-panel border-white/10 p-5 hover:border-white/20 transition-all overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white uppercase tracking-wider">
                          {item.options.role}
                        </span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {item.options.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] text-slate-400">
                          {item.options.experienceLevel || "Fresher"}
                        </Badge>
                        {item.options.resumeFileName && (
                          <Badge variant="purple" className="text-[10px] text-purple-300">
                            📄 Resume Probed
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {dateStr}
                        </span>
                        <span>&bull;</span>
                        <span>{item.questions.length} Questions Answered</span>
                        {item.status && (
                          <>
                            <span>&bull;</span>
                            <span className="capitalize text-slate-300 font-medium">{item.status}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {score !== undefined ? (
                        <div className={`px-3.5 py-1.5 rounded-xl border text-sm font-extrabold flex items-center gap-1.5 ${scoreColor}`}>
                          <Award className="w-4 h-4" />
                          <span>{score}/100</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">In Progress</span>
                      )}

                      <Link href={`/interview/results?sessionId=${item.id}`}>
                        <Button variant="glow" size="sm" className="text-xs gap-1.5 h-9">
                          View Scorecard
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(item.id, e)}
                        title="Delete this session"
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="glass-panel border-white/10 p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Interview History Saved Yet</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Complete your first practice session with Sara to track your overall scores, 5-dimensional breakdown, and improvement tips over time.
              </p>
            </div>
            <Link href="/interview/setup">
              <Button variant="glow" size="sm" className="gap-2">
                Start Your First Mock Interview
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
