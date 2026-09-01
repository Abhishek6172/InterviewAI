"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ADMIN_EMAIL, isAdmin } from "@/lib/auth/admin";
import { UserStore, AppUser, CandidateSessionRecord } from "@/lib/admin/user-store";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import { ValidationFeedback } from "@/types/analytics";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  MessageSquare,
  Search,
  Trash2,
  Star,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Calendar,
  Mail,
  User,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Award,
  ChevronLeft,
  Volume2,
  BrainCircuit,
  X,
  FileCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function AdminPortalPage() {
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<"users" | "feedback" | "telemetry">("users");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [feedbacks, setFeedbacks] = useState<ValidationFeedback[]>([]);
  const [funnelStats, setFunnelStats] = useState<any>(null);

  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Selected candidate for drill-down scorecard modal
  const [selectedCandidate, setSelectedCandidate] = useState<AppUser | null>(null);

  // Load all admin data from server & client with cross-merge persistence
  const refreshAdminData = async () => {
    setIsLoading(true);

    const clientUsers = UserStore.getClientUsers();
    let finalUsers: AppUser[] = clientUsers;

    try {
      const uRes = await fetch("/api/users");
      const uData = await uRes.json();
      if (uData?.users && Array.isArray(uData.users)) {
        // Merge server and client users to ensure persistence across reloads
        const userMap = new Map<string, AppUser>();
        clientUsers.forEach((u) => userMap.set(u.email.toLowerCase(), u));
        uData.users.forEach((u: AppUser) => {
          const existing = userMap.get(u.email.toLowerCase());
          if (existing) {
            const mergedSessions = [...(existing.sessions || [])];
            (u.sessions || []).forEach((s) => {
              if (!mergedSessions.some((ms) => ms.id === s.id)) {
                mergedSessions.push(s);
              }
            });
            userMap.set(u.email.toLowerCase(), {
              ...existing,
              ...u,
              sessions: mergedSessions,
              interviewsCompleted: Math.max(existing.interviewsCompleted || 0, u.interviewsCompleted || 0, mergedSessions.length),
            });
          } else {
            userMap.set(u.email.toLowerCase(), u);
          }
        });

        finalUsers = Array.from(userMap.values());
        setUsers(finalUsers);

        // Sync merged list back to server
        fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ users: finalUsers }),
        }).catch(() => {});
      } else {
        setUsers(clientUsers);
      }
    } catch {
      setUsers(clientUsers);
    }

    // 2. Load feedback with bidirectional merging and persistent retention
    const clientFeedbacks = AnalyticsTracker.getStoredFeedback();
    let finalFeedbacks: ValidationFeedback[] = clientFeedbacks;

    try {
      const fRes = await fetch("/api/feedback");
      const fData = await fRes.json();
      if (fData?.feedbacks && Array.isArray(fData.feedbacks)) {
        const fbMap = new Map<string, ValidationFeedback>();
        // Add client feedbacks first
        clientFeedbacks.forEach((f) => fbMap.set(f.id, f));
        // Merge server feedbacks
        fData.feedbacks.forEach((f: ValidationFeedback) => {
          if (f && f.id) {
            fbMap.set(f.id, f);
          }
        });

        finalFeedbacks = Array.from(fbMap.values()).sort((a, b) => {
          return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
        });

        setFeedbacks(finalFeedbacks);
        AnalyticsTracker.saveAllFeedback(finalFeedbacks);

        // Sync merged list back to server so server store is always complete
        fetch("/api/feedback", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedbacks: finalFeedbacks }),
        }).catch(() => {});
      } else {
        setFeedbacks(clientFeedbacks);
      }
    } catch {
      setFeedbacks(clientFeedbacks);
    }

    // 3. Funnel stats
    setFunnelStats(AnalyticsTracker.getFunnelStats());

    setIsLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated" && isAdmin(session?.user?.email)) {
      refreshAdminData();
    } else {
      setIsLoading(false);
    }
  }, [session, status]);

  // Keep selectedCandidate updated if users change
  useEffect(() => {
    if (selectedCandidate) {
      const updated = users.find((u) => u.email.toLowerCase() === selectedCandidate.email.toLowerCase());
      if (updated) setSelectedCandidate(updated);
    }
  }, [users]);

  // Delete User Handler
  const handleDeleteUser = async (email: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (confirm(`Are you sure you want to permanently delete the profile for "${email}"?`)) {
      UserStore.deleteUser(email);
      if (selectedCandidate?.email.toLowerCase() === email.toLowerCase()) {
        setSelectedCandidate(null);
      }
      try {
        await fetch("/api/users", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.warn("Delete user server error:", err);
      }
      refreshAdminData();
    }
  };

  // Delete Feedback Handler
  const handleDeleteFeedback = async (feedbackId: string) => {
    if (confirm("Are you sure you want to delete this candidate feedback?")) {
      AnalyticsTracker.deleteFeedback(feedbackId);
      try {
        await fetch("/api/feedback", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedbackId }),
        });
      } catch (err) {
        console.warn("Delete feedback server error:", err);
      }
      refreshAdminData();
    }
  };

  // Clear All Feedback Handler
  const handleClearAllFeedbacks = async () => {
    if (confirm("Are you sure you want to delete ALL feedback records? This cannot be undone.")) {
      AnalyticsTracker.clearAllFeedback();
      try {
        await fetch("/api/feedback", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clearAll: true }),
        });
      } catch (err) {
        console.warn("Clear all feedback error:", err);
      }
      refreshAdminData();
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Access Control Barrier: Only for Abhishek
  const isSuperAdmin = isAdmin(session?.user?.email);

  if (!session || !isSuperAdmin) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Administrator Access Required</h1>
          <p className="text-sm text-slate-400">
            This dashboard is restricted to the administrator ({ADMIN_EMAIL}). Please sign in with your authorized Google administrator account.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="glow"
            size="lg"
            onClick={() => signIn("google")}
            className="gap-2"
          >
            Sign In with Google Admin
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const q = userSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.lastRole && u.lastRole.toLowerCase().includes(q))
    );
  });

  // Filtered Feedbacks
  const filteredFeedbacks = feedbacks.filter((f) => {
    if (starFilter && f.overallExperience !== starFilter) return false;
    const q = feedbackSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.email && f.email.toLowerCase().includes(q)) ||
      (f.likedMost && f.likedMost.toLowerCase().includes(q)) ||
      (f.improvementSuggestions && f.improvementSuggestions.toLowerCase().includes(q))
    );
  });

  const avgPlatformScore = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.overallExperience || 5), 0) / feedbacks.length).toFixed(1)
    : "5.0";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white p-0 h-auto gap-1 mr-2">
                <ChevronLeft className="w-3.5 h-3.5" /> Back to Home
              </Button>
            </Link>
            <Badge variant="purple" className="gap-1 text-xs font-bold">
              👑 Super Admin Portal
            </Badge>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            User & Feedback Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged in as <span className="text-purple-300 font-semibold">{session.user?.name}</span> ({ADMIN_EMAIL})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAdminData}
            disabled={isLoading}
            className="gap-2 text-xs border-white/10"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            Refresh Data
          </Button>
          <Link href="/interview/setup">
            <Button variant="glow" size="sm" className="gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" /> Test Interview
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{users.length}</p>
          <p className="text-[11px] text-slate-500">Google authenticated</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Feedback Submissions</span>
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{feedbacks.length}</p>
          <p className="text-[11px] text-slate-500">Candidate evaluations</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Experience Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">{avgPlatformScore}/5.0</p>
          <p className="text-[11px] text-slate-500">Candidate satisfaction</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Interviews Started</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {funnelStats?.interviewsStarted || 0}
          </p>
          <p className="text-[11px] text-slate-500">
            {funnelStats?.interviewsCompleted || 0} completed
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
            activeTab === "users"
              ? "bg-purple-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          )}
        >
          <Users className="w-4 h-4" />
          Users & Candidates ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("feedback")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
            activeTab === "feedback"
              ? "bg-purple-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          Feedback Moderation ({feedbacks.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("telemetry")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
            activeTab === "telemetry"
              ? "bg-purple-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          )}
        >
          <BarChart3 className="w-4 h-4" />
          Funnel Telemetry
        </button>
      </div>

      {/* TAB 1: USERS & CANDIDATES MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search candidates by name, email, or role..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredUsers.length} of {users.length} registered candidates &bull; Click any candidate to view scores
            </span>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map((u) => {
                const isThisAdmin = isAdmin(u.email);
                const sessionCount = u.sessions?.length || u.interviewsCompleted || 0;
                const scoredSessions = (u.sessions || []).filter((s) => s.overallScore !== undefined);
                const avgScore = scoredSessions.length > 0
                  ? Math.round(scoredSessions.reduce((a, s) => a + (s.overallScore || 0), 0) / scoredSessions.length)
                  : undefined;

                const firstSeenStr = u.firstSeenAt && !isNaN(new Date(u.firstSeenAt).getTime())
                  ? new Date(u.firstSeenAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recently";

                const lastLoginStr = u.lastLoginAt && !isNaN(new Date(u.lastLoginAt).getTime())
                  ? new Date(u.lastLoginAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recently";

                return (
                  <Card
                    key={u.email}
                    onClick={() => setSelectedCandidate(u)}
                    className="glass-panel border-white/10 p-4 sm:p-5 hover:border-purple-500/40 hover:bg-purple-950/15 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        {u.image ? (
                          <img
                            src={u.image}
                            alt=""
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            className="w-12 h-12 rounded-2xl object-cover border border-purple-500/40 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 text-purple-300 font-bold text-sm flex items-center justify-center border border-purple-500/40 shrink-0">
                            {u.name?.slice(0, 2).toUpperCase() || "CA"}
                          </div>
                        )}

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                              {u.name}
                            </span>
                            {isThisAdmin ? (
                              <Badge variant="purple" className="text-[10px]">
                                Super Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] text-slate-300">
                                Candidate
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            {u.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400">
                        {/* Scores & Sessions pill */}
                        <div className="text-left sm:text-right">
                          <span className="block text-[11px] text-slate-500">Practice Rounds</span>
                          <span className="text-white font-bold flex items-center gap-1 sm:justify-end">
                            <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                            {sessionCount} Sessions
                          </span>
                        </div>

                        {avgScore !== undefined && (
                          <div className="text-left sm:text-right">
                            <span className="block text-[11px] text-slate-500">Avg Score</span>
                            <span className="text-emerald-400 font-extrabold flex items-center gap-1 sm:justify-end">
                              <Award className="w-3.5 h-3.5" />
                              {avgScore}/100
                            </span>
                          </div>
                        )}

                        <div className="text-left sm:text-right hidden md:block">
                          <span className="block text-[11px] text-slate-500">Last Active</span>
                          <span className="text-slate-300">{lastLoginStr}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="glow"
                            size="sm"
                            className="text-xs gap-1 h-8 px-3"
                          >
                            View Scores
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>

                          {!isThisAdmin && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteUser(u.email, e)}
                              title="Delete candidate profile"
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="glass-panel border-white/10 p-10 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-white">No candidates found matching your search</p>
              <p className="text-xs text-slate-500">Try searching for a different name or email.</p>
            </Card>
          )}
        </div>
      )}

      {/* CANDIDATE DETAIL & SCORECARD MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0e101a] border border-white/15 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3.5">
                {selectedCandidate.image ? (
                  <img
                    src={selectedCandidate.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/40 shadow-lg"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-extrabold text-lg flex items-center justify-center border-2 border-purple-500/40 shadow-lg">
                    {selectedCandidate.name?.slice(0, 2).toUpperCase() || "CA"}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-white">{selectedCandidate.name}</h3>
                    {isAdmin(selectedCandidate.email) && (
                      <Badge variant="purple" className="text-[10px]">Super Admin</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    {selectedCandidate.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Interviews</span>
                <span className="text-lg sm:text-xl font-bold text-white">
                  {selectedCandidate.sessions?.length || selectedCandidate.interviewsCompleted || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Avg Score</span>
                <span className="text-lg sm:text-xl font-bold text-purple-400">
                  {(() => {
                    const scored = (selectedCandidate.sessions || []).filter((s) => s.overallScore !== undefined);
                    if (scored.length === 0) return "—";
                    return `${Math.round(scored.reduce((a, s) => a + (s.overallScore || 0), 0) / scored.length)}/100`;
                  })()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Top Score</span>
                <span className="text-lg sm:text-xl font-bold text-emerald-400">
                  {(() => {
                    const scored = (selectedCandidate.sessions || []).filter((s) => s.overallScore !== undefined);
                    if (scored.length === 0) return "—";
                    return `${Math.max(...scored.map((s) => s.overallScore || 0))}/100`;
                  })()}
                </span>
              </div>
            </div>

            {/* Past Interview Sessions Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Interview History & Past Scorecards ({selectedCandidate.sessions?.length || 0})
              </h4>

              {selectedCandidate.sessions && selectedCandidate.sessions.length > 0 ? (
                <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                  {selectedCandidate.sessions.map((sess, idx) => {
                    const score = sess.overallScore;
                    const dateStr = sess.createdAt && !isNaN(new Date(sess.createdAt).getTime())
                      ? new Date(sess.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recent Practice Session";

                    let scoreColor = "bg-purple-500/15 text-purple-300 border-purple-500/30";
                    if (score !== undefined) {
                      if (score >= 80) scoreColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
                      else if (score >= 60) scoreColor = "bg-blue-500/15 text-blue-300 border-blue-500/30";
                      else scoreColor = "bg-amber-500/15 text-amber-300 border-amber-500/30";
                    }

                    return (
                      <div
                        key={sess.id || idx}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-white">{sess.role}</span>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {sess.difficulty}
                            </Badge>
                            {sess.experienceLevel && (
                              <Badge variant="secondary" className="text-[10px]">
                                {sess.experienceLevel}
                              </Badge>
                            )}
                            {sess.resumeFileName && (
                              <Badge variant="purple" className="text-[10px]">
                                📄 Resume
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-2">
                            <span>{dateStr}</span>
                            <span>&bull;</span>
                            <span>{sess.questionCount || 5} Questions</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {score !== undefined ? (
                            <div className={`px-3 py-1 rounded-xl border text-xs font-extrabold flex items-center gap-1 ${scoreColor}`}>
                              <Award className="w-3.5 h-3.5" />
                              <span>{score}/100</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">In Progress</span>
                          )}

                          <Link
                            href={`/interview/results?sessionId=${sess.id}`}
                            target="_blank"
                          >
                            <Button variant="glow" size="sm" className="text-xs gap-1.5 h-8">
                              View Scorecard
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                  <Award className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs font-semibold text-white">No interview sessions recorded yet</p>
                  <p className="text-[11px] text-slate-500">
                    This candidate has registered but hasn't completed their first practice session with Sara yet.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {!isAdmin(selectedCandidate.email) ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUser(selectedCandidate.email)}
                  className="text-xs gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Candidate Profile
                </Button>
              ) : (
                <span className="text-xs text-purple-400 font-medium">Protected Admin Profile</span>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedCandidate(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEEDBACK & REVIEW MODERATION */}
      {activeTab === "feedback" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={feedbackSearchQuery}
                onChange={(e) => setFeedbackSearchQuery(e.target.value)}
                placeholder="Search feedback comments, names, or suggestions..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setStarFilter(null)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg",
                    starFilter === null ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  )}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStarFilter(s)}
                    className={cn(
                      "px-2 py-1 rounded-lg flex items-center gap-0.5",
                      starFilter === s ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <span>{s}</span>
                    <Star className="w-2.5 h-2.5 fill-current" />
                  </button>
                ))}
              </div>

              {feedbacks.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllFeedbacks}
                  className="text-xs text-rose-400 border-rose-500/20 hover:bg-rose-500/10 gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {filteredFeedbacks.length > 0 ? (
            <div className="space-y-3">
              {filteredFeedbacks.map((f) => {
                const dateStr = f.submittedAt && !isNaN(new Date(f.submittedAt).getTime())
                  ? new Date(f.submittedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recent";

                return (
                  <Card
                    key={f.id}
                    className="glass-panel border-white/10 p-5 space-y-3 hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white">
                            {f.name || "Anonymous Candidate"}
                          </span>
                          {f.email && (
                            <span className="text-xs text-slate-400">({f.email})</span>
                          )}
                          <Badge variant="success" className="text-[10px]">
                            Google Form Synced
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Submitted on {dateStr}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Star Rating Badges */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>Overall: {f.overallExperience || 5}/5</span>
                          </div>

                          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
                            <BrainCircuit className="w-3.5 h-3.5" />
                            <span>Sara: {f.aiRealism || 5}/5</span>
                          </div>

                          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Voice: {f.audioExperience || 5}/5</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteFeedback(f.id)}
                          title="Delete this feedback"
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Qualitative Details */}
                    {(f.likedMost || f.improvementSuggestions || f.confusingAspects) && (
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                        {f.likedMost && (
                          <div>
                            <span className="text-purple-400 font-semibold block mb-0.5">What they liked:</span>
                            <p className="text-slate-300 italic">&ldquo;{f.likedMost}&rdquo;</p>
                          </div>
                        )}
                        {(f.improvementSuggestions || f.confusingAspects) && (
                          <div>
                            <span className="text-amber-400 font-semibold block mb-0.5">Suggestions / Feedback:</span>
                            <p className="text-slate-300 italic">
                              &ldquo;{f.improvementSuggestions || f.confusingAspects}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="glass-panel border-white/10 p-10 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-white">No feedback records found</p>
              <p className="text-xs text-slate-500">All past feedback has been cleared or none matches your filter.</p>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: FUNNEL TELEMETRY */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          <Card className="glass-panel border-white/10 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Candidate Conversion Funnel
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-xs text-slate-400">1. Landing Views</span>
                <p className="text-xl font-bold text-white">{funnelStats?.landingViews || 0}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-xs text-slate-400">2. Setup Started</span>
                <p className="text-xl font-bold text-white">{funnelStats?.setupsStarted || 0}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-xs text-slate-400">3. Interviews Started</span>
                <p className="text-xl font-bold text-white">{funnelStats?.interviewsStarted || 0}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-xs text-slate-400">4. Answers Evaluated</span>
                <p className="text-xl font-bold text-white">{funnelStats?.questionsAnswered || 0}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-xs text-slate-400">5. Completed</span>
                <p className="text-xl font-bold text-emerald-400">{funnelStats?.interviewsCompleted || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
