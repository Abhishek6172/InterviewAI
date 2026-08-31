"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  InterviewRole,
  InterviewDifficulty,
  InterviewType,
  ExperienceLevel,
  InterviewSetupOptions,
} from "@/types/interview";
import { SessionManager } from "@/lib/interview/session-manager";
import { AnalyticsTracker } from "@/lib/analytics/tracker";
import {
  Sparkles,
  ArrowRight,
  Code,
  Layers,
  Database,
  BarChart,
  Briefcase,
  Edit3,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  GraduationCap,
  Sparkle,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";

const STANDARD_ROLES: { role: string; icon: any; desc: string }[] = [
  {
    role: "Software Engineer",
    icon: Code,
    desc: "Full-stack development, algorithms, system concepts & coding trade-offs.",
  },
  {
    role: "Frontend Developer",
    icon: Layers,
    desc: "React/Next.js, performance, CSS architecture & complex state management.",
  },
  {
    role: "Backend Developer",
    icon: Database,
    desc: "APIs, database design, microservices, concurrency & scalability.",
  },
  {
    role: "Data Analyst",
    icon: BarChart,
    desc: "SQL, statistical analysis, A/B testing & data-driven insights storytelling.",
  },
  {
    role: "Product Manager",
    icon: Briefcase,
    desc: "Product strategy, roadmap prioritization, execution & metrics analysis.",
  },
];

const DIFFICULTIES: { level: InterviewDifficulty; label: string; desc: string }[] = [
  { level: "easy", label: "Easy", desc: "Foundational concepts & straightforward scenarios" },
  { level: "medium", label: "Medium", desc: "Realistic standard tech interview depth & trade-offs" },
  { level: "hard", label: "Hard", desc: "Rigorous edge cases, high scale & tough behavioral probes" },
];

const INTERVIEW_TYPES: { type: InterviewType; label: string; desc: string }[] = [
  { type: "technical", label: "Technical", desc: "Algorithms, architecture & domain problem solving" },
  { type: "behavioral", label: "Behavioral", desc: "STAR method, past experiences & team collaboration" },
  { type: "mixed", label: "Mixed", desc: "Balanced combination of technical & behavioral questions" },
];

const EXPERIENCE_LEVELS: { level: ExperienceLevel; icon: any; desc: string }[] = [
  { level: "Student", icon: GraduationCap, desc: "Currently in university / bootcamp" },
  { level: "Fresher", icon: Sparkle, desc: "0 - 1 year, entry-level candidate" },
  { level: "1–2 years", icon: Clock, desc: "Early-career developer / professional" },
  { level: "3+ years", icon: Zap, desc: "Mid-level to experienced practitioner" },
];

export default function InterviewSetupPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<string>("Software Engineer");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState("");

  const [selectedType, setSelectedType] = useState<InterviewType>("mixed");
  const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewDifficulty>("medium");
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel>("Fresher");
  const [questionCount, setQuestionCount] = useState<number>(5);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    AnalyticsTracker.track("setup_started");
  }, []);

  const handleStartInterview = async () => {
    const finalRole = isCustomRole ? customRoleInput.trim() : selectedRole;
    if (isCustomRole && !finalRole) {
      setErrorMsg("Please enter a custom role name (e.g., iOS Developer, Security Engineer, DevOps).");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const setupOptions: InterviewSetupOptions = {
      role: finalRole,
      isCustomRole,
      difficulty: selectedDifficulty,
      interviewType: selectedType,
      experienceLevel: selectedExperience,
      questionCount,
      includeFollowUps: true,
    };

    try {
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: finalRole,
          difficulty: selectedDifficulty,
          interviewType: selectedType,
          experienceLevel: selectedExperience,
          count: questionCount,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to initialize questions. Using fallback.");
      }

      const data = await res.json();
      const questions = data.questions || [];

      const session = SessionManager.createSession(setupOptions, questions);

      AnalyticsTracker.track(
        "interview_started",
        {
          role: finalRole,
          difficulty: selectedDifficulty,
          interviewType: selectedType,
          experienceLevel: selectedExperience,
          questionCount,
        },
        session.id
      );

      router.push("/interview/session");
    } catch (err: any) {
      console.error("Interview setup error:", err);
      // Fallback session so user is never blocked
      const fallbackQuestions = [
        {
          id: "q1",
          order: 1,
          question: `Can you walk me through your background in ${finalRole} and tell me about a project you are proud of?`,
          category: "introductory" as const,
          difficulty: selectedDifficulty,
          contextHint: "Highlight your specific role, technical stack, and impact.",
        },
        {
          id: "q2",
          order: 2,
          question: "What is the hardest technical challenge or bottleneck you faced while building it, and how did you resolve it?",
          category: "technical" as const,
          difficulty: selectedDifficulty,
          contextHint: "Explain your debugging methodology, root cause analysis, and chosen fix.",
        },
        {
          id: "q3",
          order: 3,
          question: "Tell me about a time you had a technical disagreement with a teammate. How did you handle it?",
          category: "behavioral" as const,
          difficulty: selectedDifficulty,
          contextHint: "Use the STAR format: Situation, Task, Action, Result.",
        },
      ];

      const session = SessionManager.createSession(setupOptions, fallbackQuestions);
      router.push("/interview/session");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 text-slate-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
        <Badge variant="outline" className="text-xs text-slate-400">
          Fast 60-Second Setup
        </Badge>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Configure Your Mock Interview
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Tailor the AI interviewer to simulate the exact position, seniority, and style of your target company.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs text-center">
          {errorMsg}
        </div>
      )}

      {/* 1. Target Role */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            1
          </span>
          Target Role
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STANDARD_ROLES.map((r) => {
            const Icon = r.icon;
            const isSelected = !isCustomRole && selectedRole === r.role;
            return (
              <button
                key={r.role}
                type="button"
                onClick={() => {
                  setSelectedRole(r.role);
                  setIsCustomRole(false);
                }}
                className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                    : "glass-panel border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${isSelected ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </div>
                <span className="text-sm font-semibold mb-1">{r.role}</span>
                <span className="text-xs text-muted-foreground leading-relaxed">{r.desc}</span>
              </button>
            );
          })}

          {/* Custom Role Option */}
          <button
            type="button"
            onClick={() => setIsCustomRole(true)}
            className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 ${
              isCustomRole
                ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                : "glass-panel border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${isCustomRole ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400"}`}>
                <Edit3 className="w-4 h-4" />
              </div>
              {isCustomRole && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
            </div>
            <span className="text-sm font-semibold mb-1">Custom Role</span>
            <span className="text-xs text-muted-foreground leading-relaxed">
              Enter any specialized job title (e.g. AI Engineer, Mobile, DevOps).
            </span>
          </button>
        </div>

        {/* Custom Role Input */}
        {isCustomRole && (
          <div className="p-4 rounded-2xl glass-panel border border-blue-500/30 space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-semibold text-blue-400">Specify Custom Job Role Title:</label>
            <input
              type="text"
              value={customRoleInput}
              onChange={(e) => setCustomRoleInput(e.target.value)}
              placeholder="e.g. Cloud Security Engineer, iOS Developer, Machine Learning Intern"
              className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* 2. Interview Type */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            2
          </span>
          Interview Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {INTERVIEW_TYPES.map((t) => {
            const isSelected = selectedType === t.type;
            return (
              <button
                key={t.type}
                type="button"
                onClick={() => setSelectedType(t.type)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500"
                    : "glass-panel border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{t.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>
                <span className="text-xs text-muted-foreground">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Difficulty */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            3
          </span>
          Difficulty
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DIFFICULTIES.map((d) => {
            const isSelected = selectedDifficulty === d.level;
            return (
              <button
                key={d.level}
                type="button"
                onClick={() => setSelectedDifficulty(d.level)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10 ring-1 ring-purple-500"
                    : "glass-panel border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{d.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </div>
                <span className="text-xs text-muted-foreground">{d.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Experience Level */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            4
          </span>
          Experience Level (Optional Context)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EXPERIENCE_LEVELS.map((exp) => {
            const Icon = exp.icon;
            const isSelected = selectedExperience === exp.level;
            return (
              <button
                key={exp.level}
                type="button"
                onClick={() => setSelectedExperience(exp.level)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-blue-600/20 border-blue-500 text-white shadow-md ring-1 ring-blue-500"
                    : "glass-panel border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{exp.level}</span>
                  <Icon className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-[10px] text-muted-foreground">{exp.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Number of Questions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl glass-panel border border-white/5 gap-3">
        <div>
          <span className="text-xs font-semibold text-white block">Number of Questions</span>
          <span className="text-[11px] text-muted-foreground">Select how many questions you want to practice</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[3, 5, 8, 10].map((count) => (
            <Button
              key={count}
              type="button"
              variant={questionCount === count ? "default" : "outline"}
              size="sm"
              onClick={() => setQuestionCount(count)}
              className="text-xs h-8 px-3"
            >
              {count} Questions {count === 3 ? "(Fast Test)" : ""}
            </Button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 flex flex-col items-center">
        <Button
          size="lg"
          variant="glow"
          onClick={handleStartInterview}
          disabled={isLoading}
          className="w-full sm:w-80 h-13 gap-2.5 text-base shadow-xl"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Starting AI Interview...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Start Mock Interview
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
        <span className="text-xs text-slate-500 mt-2">
          You will interact with an adaptive AI avatar &bull; Voice & typing supported
        </span>
      </div>
    </div>
  );
}
