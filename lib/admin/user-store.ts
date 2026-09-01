export interface CandidateSessionRecord {
  id: string;
  role: string;
  difficulty: string;
  experienceLevel?: string;
  overallScore?: number;
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
  questionCount: number;
  scorecard?: any;
  resumeFileName?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  firstSeenAt: string;
  lastLoginAt: string;
  interviewsCompleted?: number;
  lastRole?: string;
  sessions?: CandidateSessionRecord[];
}

const USERS_STORAGE_KEY = "interviewai_registered_users_v2";

// Server-side persistent user map
let serverUserMap: Map<string, AppUser> = new Map();

// Initialize Admin
const defaultAdmin: AppUser = {
  id: "admin_super",
  name: "Abhishek Kumar Das Pattanayak",
  email: "abhishekkumardaspattanayak444@gmail.com",
  firstSeenAt: "2026-09-01T06:29:00.000Z",
  lastLoginAt: new Date().toISOString(),
  interviewsCompleted: 2,
  lastRole: "Product Manager",
  sessions: [
    {
      id: "session_sample_1",
      role: "Product Manager",
      difficulty: "medium",
      experienceLevel: "3+ years",
      overallScore: 88,
      createdAt: "2026-09-01T06:30:00.000Z",
      questionCount: 5,
    },
  ],
};
serverUserMap.set(defaultAdmin.email.toLowerCase(), defaultAdmin);

export class UserStore {
  public static upsertUser(user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    lastRole?: string;
    sessions?: CandidateSessionRecord[];
  }): AppUser | null {
    if (!user.email) return null;

    const email = user.email.trim().toLowerCase();
    const now = new Date().toISOString();
    const existing = serverUserMap.get(email);

    let mergedSessions: CandidateSessionRecord[] = existing?.sessions || [];
    if (user.sessions && user.sessions.length > 0) {
      const sessionMap = new Map<string, CandidateSessionRecord>();
      mergedSessions.forEach((s) => sessionMap.set(s.id, s));
      user.sessions.forEach((s) => sessionMap.set(s.id, s));
      mergedSessions = Array.from(sessionMap.values()).sort((a, b) => {
        const timeA = new Date(a.createdAt || a.startedAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.startedAt || 0).getTime();
        return timeB - timeA;
      });
    }

    const updatedUser: AppUser = {
      id: existing?.id || user.id || `user_${Date.now()}`,
      name: user.name || existing?.name || "Candidate",
      email,
      image: user.image || existing?.image || undefined,
      firstSeenAt: existing?.firstSeenAt || now,
      lastLoginAt: now,
      interviewsCompleted: mergedSessions.length > 0 ? mergedSessions.length : existing?.interviewsCompleted || 0,
      lastRole: mergedSessions[0]?.role || user.lastRole || existing?.lastRole || "Software Engineer",
      sessions: mergedSessions,
    };

    serverUserMap.set(email, updatedUser);

    // Save to client localStorage
    if (typeof window !== "undefined") {
      try {
        const localList = this.getClientUsers();
        const map = new Map<string, AppUser>();
        localList.forEach((u) => map.set(u.email.toLowerCase(), u));
        map.set(email, updatedUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(Array.from(map.values())));
      } catch (err) {
        console.warn("Client localStorage sync error:", err);
      }
    }

    return updatedUser;
  }

  public static addSessionToUser(email: string, sessionRecord: CandidateSessionRecord): void {
    const cleanEmail = email.trim().toLowerCase();
    const existing = serverUserMap.get(cleanEmail);
    if (!existing) return;

    const sessions = existing.sessions || [];
    const idx = sessions.findIndex((s) => s.id === sessionRecord.id);
    if (idx >= 0) {
      sessions[idx] = sessionRecord;
    } else {
      sessions.unshift(sessionRecord);
    }

    existing.sessions = sessions;
    existing.interviewsCompleted = sessions.length;
    existing.lastRole = sessionRecord.role;
    serverUserMap.set(cleanEmail, existing);

    if (typeof window !== "undefined") {
      try {
        const local = this.getClientUsers();
        const user = local.find((u) => u.email.toLowerCase() === cleanEmail);
        if (user) {
          user.sessions = sessions;
          user.interviewsCompleted = sessions.length;
          user.lastRole = sessionRecord.role;
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(local));
        }
      } catch {
        // ignore
      }
    }
  }

  public static getServerUsers(): AppUser[] {
    return Array.from(serverUserMap.values());
  }

  public static getClientUsers(): AppUser[] {
    if (typeof window === "undefined") return Array.from(serverUserMap.values());
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (!data) {
        const init = Array.from(serverUserMap.values());
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(init));
        return init;
      }
      const parsed: AppUser[] = JSON.parse(data);
      if (!parsed.some((u) => u.email.toLowerCase() === defaultAdmin.email.toLowerCase())) {
        parsed.unshift(defaultAdmin);
      }
      return parsed;
    } catch {
      return Array.from(serverUserMap.values());
    }
  }

  public static deleteUser(email: string): void {
    const cleanEmail = email.trim().toLowerCase();
    serverUserMap.delete(cleanEmail);

    if (typeof window !== "undefined") {
      try {
        const local = this.getClientUsers().filter((u) => u.email.toLowerCase() !== cleanEmail);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(local));
      } catch {
        // ignore
      }
    }
  }

  public static mergeIncomingUsers(incomingList: AppUser[]): AppUser[] {
    if (Array.isArray(incomingList)) {
      for (const u of incomingList) {
        if (u && u.email) {
          this.upsertUser(u);
        }
      }
    }
    return this.getServerUsers();
  }
}
