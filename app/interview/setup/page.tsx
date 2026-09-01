"use client";

import React, { useState, useEffect, useRef } from "react";
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
  FileText,
  UploadCloud,
  X,
  FileCheck,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/auth/UserMenu";
import { SignInModal } from "@/components/auth/SignInModal";

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
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<string>("Software Engineer");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState("");

  const [selectedType, setSelectedType] = useState<InterviewType>("mixed");
  const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewDifficulty>("medium");
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel>("Fresher");
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Resume Upload State
  const [resumeText, setResumeText] = useState<string>("");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [showTextPreview, setShowTextPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    AnalyticsTracker.track("setup_started");
    if (status === "unauthenticated") {
      setShowAuthModal(true);
    }
  }, [status]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.text) {
        setResumeText(data.text);
        setResumeFileName(file.name);
        setShowManualPaste(false); // Hide the summary/textarea after file upload
      } else {
        throw new Error(data.error || "Failed to parse resume");
      }
    } catch (err: any) {
      console.error("Resume upload error:", err);
      setErrorMsg("Could not extract text from document. You can paste your resume or project details in the text box below.");
      setShowManualPaste(true);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleClearResume = () => {
    setResumeText("");
    setResumeFileName(null);
    setShowManualPaste(false);
    setShowTextPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStartInterview = async () => {
    if (!session || !session.user) {
      setShowAuthModal(true);
      return;
    }

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
      resumeText: resumeText.trim() || undefined,
      resumeFileName: resumeFileName || undefined,
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
          resumeText: resumeText.trim() || undefined,
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
          hasResume: Boolean(resumeText.trim()),
          resumeFileName: resumeFileName || "none",
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
          question: resumeText.trim()
            ? `I reviewed your resume for ${finalRole}. Can you walk me through the architecture and your primary contributions to the main project listed on your resume?`
            : `Can you walk me through your background in ${finalRole} and tell me about a project you are proud of?`,
          category: "introductory" as const,
          difficulty: selectedDifficulty,
          contextHint: "Highlight your specific ownership, technical stack, and results.",
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
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 text-slate-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs text-purple-400 border-purple-500/30 hidden sm:inline-flex">
            Fast 60-Second Setup
          </Badge>
          <UserMenu />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Configure Your Mock Interview
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Tailor the AI interviewer to simulate the exact position, seniority, resume projects, and style of your target company.
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
          <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
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
                    ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/15 ring-1 ring-purple-500"
                    : "glass-panel border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${isSelected ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
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
                ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/15 ring-1 ring-purple-500"
                : "glass-panel border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${isCustomRole ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400"}`}>
                <Edit3 className="w-4 h-4" />
              </div>
              {isCustomRole && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
            </div>
            <span className="text-sm font-semibold mb-1">Custom Role</span>
            <span className="text-xs text-muted-foreground leading-relaxed">
              Enter any specialized job title (e.g. AI Engineer, Mobile, DevOps).
            </span>
          </button>
        </div>

        {/* Custom Role Input */}
        {isCustomRole && (
          <div className="p-4 rounded-2xl glass-panel border border-purple-500/30 space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-semibold text-purple-400">Specify Custom Job Role Title:</label>
            <input
              type="text"
              value={customRoleInput}
              onChange={(e) => setCustomRoleInput(e.target.value)}
              placeholder="e.g. Cloud Security Engineer, iOS Developer, Machine Learning Intern"
              className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* 2. Resume & Project Context (Clean State) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
              2
            </span>
            Upload Resume / Projects (Optional)
          </label>
          <span className="text-[11px] text-purple-300">The AI will question your actual projects</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
          id="resume-upload"
        />

        {/* Case A: Resume Attached Successfully */}
        {resumeFileName ? (
          <Card className="glass-panel border-emerald-500/40 bg-emerald-950/10 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-tight">{resumeFileName}</span>
                    <Badge variant="success" className="text-[10px] px-2 py-0">
                      ✓ Attached & Ready
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {resumeText.length} characters parsed &bull; The AI will ask questions about projects in this resume.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs border-white/10 hover:border-white/30 h-8"
                >
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleClearResume}
                  className="text-xs h-8"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Remove
                </Button>
              </div>
            </div>

            {/* Collapsible text preview */}
            <div className="pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowTextPreview(!showTextPreview)}
                className="text-[11px] text-purple-300 hover:text-purple-200 flex items-center gap-1"
              >
                {showTextPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showTextPreview ? "Hide parsed resume content" : "View parsed resume content"}
              </button>

              {showTextPreview && (
                <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-300 font-mono max-h-36 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                  {resumeText}
                </div>
              )}
            </div>
          </Card>
        ) : (
          /* Case B: No Resume Attached Yet */
          <Card className="glass-panel border-white/10 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block">
                    Upload your resume document
                  </span>
                  <span className="text-xs text-slate-400">
                    Supports .pdf, .txt, .docx &bull; The AI will formulate questions from your work experience
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="glow"
                  size="sm"
                  disabled={isUploadingResume}
                  className="w-full sm:w-auto gap-2 text-xs h-9 px-4 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploadingResume ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Parsing Resume...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Attach Resume (.pdf / .docx)
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManualPaste(!showManualPaste)}
                  className="text-xs text-slate-400 hover:text-white whitespace-nowrap h-9"
                >
                  {showManualPaste ? "Cancel" : "Or Paste Text"}
                </Button>
              </div>
            </div>

            {/* Manual text paste fallback area (only shown if toggled) */}
            {showManualPaste && (
              <div className="space-y-2 pt-3 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Paste your projects or background summary:
                </span>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="e.g. 'Built a full-stack real-time chat app with Next.js, WebSockets, and Redis. Reduced server latency by 35%...'"
                  rows={3}
                  className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            )}
          </Card>
        )}
      </div>

      {/* 3. Interview Type */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
            3
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
                    ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/15 ring-1 ring-purple-500"
                    : "glass-panel border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{t.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </div>
                <span className="text-xs text-muted-foreground">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Difficulty */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
            4
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
                    ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/15 ring-1 ring-purple-500"
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

      {/* 5. Experience Level */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
            5
          </span>
          Experience Level
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
                    ? "bg-purple-600/20 border-purple-500 text-white shadow-md ring-1 ring-purple-500"
                    : "glass-panel border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{exp.level}</span>
                  <Icon className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span className="text-[10px] text-muted-foreground">{exp.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Number of Questions */}
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
              Generating Tailored AI Interview...
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
          {resumeFileName
            ? `Interviewer primed with ${resumeFileName} &bull; Voice & typing supported`
            : "Powered by real-time LLM reasoning &bull; Voice & typing supported"}
        </span>
      </div>

      {/* Mandatory Sign In Modal Popup */}
      <SignInModal
        isOpen={showAuthModal}
        onClose={() => router.push("/")}
      />
    </div>
  );
}
