/**
 * Core Data Models for InterviewAI
 */

export type InterviewRole =
  | "Software Engineer"
  | "Frontend Developer"
  | "Backend Developer"
  | "Data Analyst"
  | "Product Manager"
  | string; // Allows custom role entry

export type InterviewDifficulty = "easy" | "medium" | "hard";

export type InterviewType = "technical" | "behavioral" | "mixed";

export type ExperienceLevel = "Student" | "Fresher" | "1–2 years" | "3+ years";

export type InterviewStatus = "setup" | "in-progress" | "completed" | "abandoned";

export interface InterviewSetupOptions {
  role: string;
  isCustomRole?: boolean;
  difficulty: InterviewDifficulty;
  interviewType: InterviewType;
  experienceLevel: ExperienceLevel;
  questionCount: number; // 3 (quick test), 5, 8, 10
  includeFollowUps: boolean;
  resumeText?: string; // Optional Candidate Resume / Project Details
  resumeFileName?: string;
}

export interface InterviewQuestion {
  id: string;
  order: number;
  question: string;
  category: "technical" | "behavioral" | "problem-solving" | "system-design" | "introductory";
  difficulty: InterviewDifficulty;
  contextHint?: string;
  expectedTopics?: string[];
  isFollowUp?: boolean;
  parentQuestionId?: string;
  followUpReason?: string;
}

export interface InterviewAnswer {
  questionId: string;
  answerText: string;
  durationSeconds: number;
  submittedAt: string;
  inputMode: "voice" | "text";
}

export interface QuestionEvaluation {
  questionId: string;
  score: number; // 1-10
  communicationScore: number; // 1-10
  technicalScore: number; // 1-10
  relevanceScore: number; // 1-10
  clarityScore: number; // 1-10
  confidenceScore: number; // 1-10
  feedback: string;
  whatWasGood: string[];
  whatCouldImprove: string[];
  shouldFollowUp?: boolean;
  followUpQuestionText?: string;
}

export interface CategoryScore {
  category: string;
  score: number; // 1-10
  totalQuestions: number;
}

export interface InterviewScorecard {
  sessionId: string;
  overallScore: number; // 1-100
  communicationScore: number; // 1-10
  technicalScore: number; // 1-10
  relevanceScore: number; // 1-10
  clarityScore: number; // 1-10
  confidenceScore: number; // 1-10
  executiveSummary: string;
  strengths: string[];
  areasToImprove: string[];
  suggestedNextSteps: string[];
  completedAt: string;
}

export interface InterviewSession {
  id: string;
  options: InterviewSetupOptions;
  status: InterviewStatus;
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  answers: Record<string, InterviewAnswer>;
  evaluations: Record<string, QuestionEvaluation>;
  scorecard?: InterviewScorecard;
  startedAt: string;
  completedAt?: string;
}
