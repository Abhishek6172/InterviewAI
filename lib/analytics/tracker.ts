import { AnalyticsEvent, AnalyticsEventType, ValidationFeedback } from "@/types/analytics";

const ANALYTICS_STORAGE_KEY = "interviewai_analytics_events";
const FEEDBACK_STORAGE_KEY = "interviewai_user_feedback";

export class AnalyticsTracker {
  public static track(
    eventName: AnalyticsEventType,
    properties?: Record<string, any>,
    sessionId?: string
  ): void {
    const event: AnalyticsEvent = {
      eventName,
      timestamp: new Date().toISOString(),
      sessionId,
      properties,
    };

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
        const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
        events.push(event);
        localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events));
      } catch (err) {
        console.warn("Could not record analytics event locally:", err);
      }
    }
  }

  public static getStoredEvents(): AnalyticsEvent[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public static saveFeedback(feedback: ValidationFeedback): void {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        const feedbacks: ValidationFeedback[] = stored ? JSON.parse(stored) : [];
        feedbacks.unshift(feedback);
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbacks));
      } catch (err) {
        console.warn("Could not save validation feedback locally:", err);
      }
    }
  }

  public static getStoredFeedback(): ValidationFeedback[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public static deleteFeedback(feedbackId: string): void {
    if (typeof window === "undefined") return;
    try {
      const feedbacks = this.getStoredFeedback().filter((f) => f.id !== feedbackId);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbacks));
    } catch (err) {
      console.warn("Error deleting feedback:", err);
    }
  }

  public static clearAllFeedback(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(FEEDBACK_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  public static getFunnelStats() {
    const events = this.getStoredEvents();
    const landingViews = events.filter((e) => e.eventName === "landing_view").length;
    const setupsStarted = events.filter((e) => e.eventName === "setup_started").length;
    const interviewsStarted = events.filter((e) => e.eventName === "interview_started").length;
    const questionsAnswered = events.filter((e) => e.eventName === "question_answered").length;
    const interviewsCompleted = events.filter((e) => e.eventName === "interview_completed").length;
    const retriesClicked = events.filter((e) => e.eventName === "retry_clicked").length;

    return {
      landingViews,
      setupsStarted,
      interviewsStarted,
      questionsAnswered,
      interviewsCompleted,
      retriesClicked,
      completionRate: interviewsStarted > 0 ? (interviewsCompleted / interviewsStarted) * 100 : 0,
    };
  }
}
