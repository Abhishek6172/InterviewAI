import { AnalyticsEvent, AnalyticsEventType, ValidationFeedback } from "@/types/analytics";

const ANALYTICS_STORAGE_KEY = "interviewai_analytics_events_v2";
const PRIMARY_FEEDBACK_KEY = "interviewai_user_feedback_v2";
const PAST_FEEDBACK_KEYS = [
  "interviewai_user_feedback_v2",
  "interviewai_user_feedback_v1",
  "interviewai_user_feedback",
  "interviewai_feedback",
  "interviewai_validation_feedback",
];
const DELETED_FEEDBACK_KEY = "interviewai_deleted_feedback_v2";

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
        const stored = this.getStoredFeedback();
        const map = new Map<string, ValidationFeedback>();
        stored.forEach((f) => map.set(f.id, f));
        map.set(feedback.id, feedback);
        const list = Array.from(map.values()).sort(
          (a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
        );
        localStorage.setItem(PRIMARY_FEEDBACK_KEY, JSON.stringify(list));
      } catch (err) {
        console.warn("Could not save validation feedback locally:", err);
      }
    }
  }

  public static saveAllFeedback(feedbacks: ValidationFeedback[]): void {
    if (typeof window !== "undefined") {
      try {
        const deletedStr = localStorage.getItem(DELETED_FEEDBACK_KEY);
        const deleted: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        const delSet = new Set(deleted);

        const filtered = feedbacks.filter((f) => !delSet.has(f.id));
        localStorage.setItem(PRIMARY_FEEDBACK_KEY, JSON.stringify(filtered));
      } catch (err) {
        console.warn("Could not save all feedback locally:", err);
      }
    }
  }

  /**
   * Scans across all historical feedback keys to guarantee no submitted feedback is lost.
   */
  public static getStoredFeedback(): ValidationFeedback[] {
    if (typeof window === "undefined") return [];
    try {
      const deletedStr = localStorage.getItem(DELETED_FEEDBACK_KEY);
      const deleted: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      const delSet = new Set(deleted);

      const fbMap = new Map<string, ValidationFeedback>();

      for (const key of PAST_FEEDBACK_KEYS) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const parsed: ValidationFeedback[] = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              for (const f of parsed) {
                if (f && f.id && !delSet.has(f.id)) {
                  fbMap.set(f.id, f);
                }
              }
            }
          } catch {
            // ignore
          }
        }
      }

      const merged = Array.from(fbMap.values()).sort(
        (a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
      );

      localStorage.setItem(PRIMARY_FEEDBACK_KEY, JSON.stringify(merged));
      return merged;
    } catch {
      return [];
    }
  }

  public static deleteFeedback(feedbackId: string): void {
    if (typeof window === "undefined") return;
    try {
      const deletedStr = localStorage.getItem(DELETED_FEEDBACK_KEY);
      const deleted: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      if (!deleted.includes(feedbackId)) {
        deleted.push(feedbackId);
        localStorage.setItem(DELETED_FEEDBACK_KEY, JSON.stringify(deleted));
      }

      for (const key of PAST_FEEDBACK_KEYS) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const parsed: ValidationFeedback[] = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              const filtered = parsed.filter((f) => f.id !== feedbackId);
              localStorage.setItem(key, JSON.stringify(filtered));
            }
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      console.warn("Error deleting feedback:", err);
    }
  }

  public static clearAllFeedback(): void {
    if (typeof window === "undefined") return;
    try {
      const current = this.getStoredFeedback();
      const deletedStr = localStorage.getItem(DELETED_FEEDBACK_KEY);
      const deleted: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      current.forEach((f) => {
        if (!deleted.includes(f.id)) deleted.push(f.id);
      });
      localStorage.setItem(DELETED_FEEDBACK_KEY, JSON.stringify(deleted));
      for (const key of PAST_FEEDBACK_KEYS) {
        localStorage.removeItem(key);
      }
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
