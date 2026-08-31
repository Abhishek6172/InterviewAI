import {
  InterviewSession,
  InterviewSetupOptions,
  InterviewQuestion,
  InterviewAnswer,
  QuestionEvaluation,
  InterviewScorecard,
} from "@/types/interview";

const ACTIVE_SESSION_KEY = "interviewai_active_session";

export class SessionManager {
  public static createSession(
    options: InterviewSetupOptions,
    questions: InterviewQuestion[]
  ): InterviewSession {
    const session: InterviewSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      options,
      status: "in-progress",
      currentQuestionIndex: 0,
      questions,
      answers: {},
      evaluations: {},
      startedAt: new Date().toISOString(),
    };

    this.saveSession(session);
    return session;
  }

  public static saveSession(session: InterviewSession): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
      } catch (err) {
        console.warn("Error persisting session to localStorage:", err);
      }
    }
  }

  public static getActiveSession(): InterviewSession | null {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(ACTIVE_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public static recordAnswer(
    sessionId: string,
    questionId: string,
    answerText: string,
    durationSeconds: number,
    inputMode: "voice" | "text"
  ): InterviewSession | null {
    const session = this.getActiveSession();
    if (!session || session.id !== sessionId) return null;

    session.answers[questionId] = {
      questionId,
      answerText,
      durationSeconds,
      submittedAt: new Date().toISOString(),
      inputMode,
    };

    this.saveSession(session);
    return session;
  }

  public static recordEvaluation(
    sessionId: string,
    evaluation: QuestionEvaluation
  ): InterviewSession | null {
    const session = this.getActiveSession();
    if (!session || session.id !== sessionId) return null;

    session.evaluations[evaluation.questionId] = evaluation;
    this.saveSession(session);
    return session;
  }

  public static insertFollowUpQuestion(
    sessionId: string,
    followUpQuestion: InterviewQuestion
  ): InterviewSession | null {
    const session = this.getActiveSession();
    if (!session || session.id !== sessionId) return null;

    // Insert follow-up immediately following the current question
    const currentIndex = session.currentQuestionIndex;
    session.questions.splice(currentIndex + 1, 0, followUpQuestion);

    // Re-index orders
    session.questions.forEach((q, idx) => {
      q.order = idx + 1;
    });

    this.saveSession(session);
    return session;
  }

  public static completeSession(
    sessionId: string,
    scorecard: InterviewScorecard
  ): InterviewSession | null {
    const session = this.getActiveSession();
    if (!session || session.id !== sessionId) return null;

    session.status = "completed";
    session.scorecard = scorecard;
    session.completedAt = new Date().toISOString();

    this.saveSession(session);
    return session;
  }

  public static clearSession(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      } catch {
        // ignore
      }
    }
  }
}
