/**
 * Analytics and User Validation Types - Stage 3 Production
 */

export type AnalyticsEventType =
  | "landing_view"
  | "setup_started"
  | "interview_started"
  | "question_answered"
  | "interview_completed"
  | "results_viewed"
  | "feedback_submitted"
  | "retry_clicked"
  | "speech_recognition_started"
  | "speech_recognition_stopped";

export interface AnalyticsEvent {
  eventName: AnalyticsEventType;
  timestamp: string;
  sessionId?: string;
  properties?: Record<string, string | number | boolean | undefined>;
}

export interface ValidationFeedback {
  id: string;
  sessionId: string;
  name?: string;
  email?: string;
  isUseful?: boolean | null;
  overallExperience: number; // 1-5
  aiRealism: number; // 1-5
  realismRating?: number; // legacy alias
  experienceRating?: number; // legacy alias
  audioExperience?: number; // 1-5
  rolePreparedness?: "much_more_prepared" | "somewhat_prepared" | "needs_practice" | string;
  likedMost?: string;
  confusingAspects?: string;
  improvementSuggestions?: string;
  wouldUseAgain?: "yes" | "maybe" | "no" | null;
  submittedAt: string;
  googleFormSynced?: boolean;
}
