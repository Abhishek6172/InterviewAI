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

const USERS_STORAGE_KEY = "interviewai_registered_users_v3";
const DELETED_USERS_KEY = "interviewai_deleted_users_v3";

// In-memory server cache
let serverUserMap: Map<string, AppUser> = new Map();
let deletedUsersSet: Set<string> = new Set();

// Initialize Admin profile
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

if (!deletedUsersSet.has(defaultAdmin.email.toLowerCase())) {
  serverUserMap.set(defaultAdmin.email.toLowerCase(), defaultAdmin);
}

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
    if (deletedUsersSet.has(email) && email !== defaultAdmin.email.toLowerCase()) {
      return null;
    }

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

    // Client localStorage retention
    if (typeof window !== "undefined") {
      try {
        const localList = this.getClientUsers();
        const map = new Map<string, AppUser>();
        localList.forEach((u) => map.set(u.email.toLowerCase(), u));
        map.set(email, updatedUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(Array.from(map.values())));
      } catch (err) {
        console.warn("Client localStorage save error:", err);
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
    return Array.from(serverUserMap.values()).filter((u) => !deletedUsersSet.has(u.email.toLowerCase()));
  }

  public static getClientUsers(): AppUser[] {
    if (typeof window === "undefined") return this.getServerUsers();
    try {
      const deletedStr = localStorage.getItem(DELETED_USERS_KEY);
      const deleted: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      const delSet = new Set(deleted.map((e) => e.toLowerCase()));

      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (!data) {
        const init = this.getServerUsers().filter((u) => !delSet.has(u.email.toLowerCase()));
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(init));
        return init;
      }
      const parsed: AppUser[] = JSON.parse(data);
      const filtered = parsed.filter((u) => !delSet.has(u.email.toLowerCase()));
      if (!filtered.some((u) => u.email.toLowerCase() === defaultAdmin.email.toLowerCase()) && !delSet.has(defaultAdmin.email.toLowerCase())) {
        filtered.unshift(defaultAdmin);
      }
      return filtered;
    } catch {
      return this.getServerUsers();
    }
  }

  public static deleteUser(email: string): void {
    const cleanEmail = email.trim().toLowerCase();
    serverUserMap.delete(cleanEmail);
    deletedUsersSet.add(cleanEmail);

    if (typeof window !== "undefined") {
      try {
        const local = this.getClientUsers().filter((u) => u.email.toLowerCase() !== cleanEmail);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(local));

        const deletedStr = localStorage.getItem(DELETED_USERS_KEY);
        const deleted: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        if (!deleted.includes(cleanEmail)) {
          deleted.push(cleanEmail);
          localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(deleted));
        }
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
