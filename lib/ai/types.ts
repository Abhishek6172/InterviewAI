import {
  InterviewDifficulty,
  InterviewType,
  ExperienceLevel,
  InterviewQuestion,
  QuestionEvaluation,
  InterviewScorecard,
} from "@/types/interview";

export interface ConversationTurn {
  questionId: string;
  questionText: string;
  category: string;
  userAnswer: string;
  feedback?: string;
  score?: number;
}

export interface GenerateQuestionsRequest {
  role: string;
  difficulty: InterviewDifficulty;
  interviewType: InterviewType;
  experienceLevel: ExperienceLevel;
  count: number;
  resumeText?: string;
  conversationHistory?: ConversationTurn[];
}

export interface GenerateQuestionsResponse {
  questions: InterviewQuestion[];
}

export interface EvaluateAnswerRequest {
  role: string;
  difficulty: InterviewDifficulty;
  interviewType: InterviewType;
  experienceLevel: ExperienceLevel;
  question: InterviewQuestion;
  userAnswer: string;
  resumeText?: string;
  conversationHistory?: ConversationTurn[];
  canFollowUp?: boolean;
}

export interface EvaluateAnswerResponse {
  evaluation: QuestionEvaluation;
  followUpQuestion?: InterviewQuestion;
}

export interface GenerateScorecardRequest {
  role: string;
  difficulty: InterviewDifficulty;
  interviewType: InterviewType;
  experienceLevel: ExperienceLevel;
  questions: InterviewQuestion[];
  answers: Record<string, { answerText: string; durationSeconds: number }>;
  evaluations: Record<string, QuestionEvaluation>;
  resumeText?: string;
}

export interface GenerateScorecardResponse {
  scorecard: InterviewScorecard;
}

export interface AIService {
  generateQuestions(req: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse>;
  evaluateAnswer(req: EvaluateAnswerRequest): Promise<EvaluateAnswerResponse>;
  generateScorecard(req: GenerateScorecardRequest): Promise<GenerateScorecardResponse>;
}
