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
  isUseful: boolean | null;
  realismRating?: number; // 1-5
  experienceRating?: number; // 1-5
  wouldUseAgain?: "yes" | "maybe" | "no" | null;
  confusingAspects?: string;
  improvementSuggestions?: string;
  submittedAt: string;
}
