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

const PRIMARY_USERS_KEY = "interviewai_registered_users_v3";
const PAST_USER_KEYS = [
  "interviewai_registered_users_v3",
  "interviewai_registered_users_v2",
  "interviewai_registered_users",
  "interviewai_users",
  "interviewai_admin_users",
];
const DELETED_USERS_KEY = "interviewai_deleted_users_v3";

// In-memory server cache
let serverUserMap: Map<string, AppUser> = new Map();
let deletedUsersSet: Set<string> = new Set();

// Default Super Admin Profile
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

    // Save to all client storage caches
    if (typeof window !== "undefined") {
      try {
        const localList = this.getClientUsers();
        const map = new Map<string, AppUser>();
        localList.forEach((u) => map.set(u.email.toLowerCase(), u));
        map.set(email, updatedUser);
        const finalArr = Array.from(map.values());
        localStorage.setItem(PRIMARY_USERS_KEY, JSON.stringify(finalArr));
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
          localStorage.setItem(PRIMARY_USERS_KEY, JSON.stringify(local));
        }
      } catch {
        // ignore
      }
    }
  }

  public static getServerUsers(): AppUser[] {
    return Array.from(serverUserMap.values()).filter((u) => !deletedUsersSet.has(u.email.toLowerCase()));
  }

  /**
   * Retrieves all users by aggregating across all legacy & current storage keys
   * guaranteeing no past candidate login is ever lost.
   */
  public static getClientUsers(): AppUser[] {
    if (typeof window === "undefined") return this.getServerUsers();
    try {
      const deletedStr = localStorage.getItem(DELETED_USERS_KEY);
      const deleted: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      const delSet = new Set(deleted.map((e) => e.toLowerCase()));

      const userMap = new Map<string, AppUser>();

      // Scan all legacy keys
      for (const key of PAST_USER_KEYS) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
              for (const u of parsed) {
                if (u && u.email && !delSet.has(u.email.toLowerCase())) {
                  const email = u.email.toLowerCase();
                  const existing = userMap.get(email);
                  if (existing) {
                    const mergedSessions = [...(existing.sessions || [])];
                    (u.sessions || []).forEach((s: CandidateSessionRecord) => {
                      if (!mergedSessions.some((ms) => ms.id === s.id)) {
                        mergedSessions.push(s);
                      }
                    });
                    userMap.set(email, {
                      ...existing,
                      ...u,
                      sessions: mergedSessions,
                      interviewsCompleted: Math.max(existing.interviewsCompleted || 0, u.interviewsCompleted || 0, mergedSessions.length),
                    });
                  } else {
                    userMap.set(email, u);
                  }
                }
              }
            }
          } catch {
            // ignore JSON parse errors from corrupt keys
          }
        }
      }

      // Merge with in-memory server users
      for (const u of this.getServerUsers()) {
        if (u && u.email && !delSet.has(u.email.toLowerCase())) {
          const email = u.email.toLowerCase();
          if (!userMap.has(email)) {
            userMap.set(email, u);
          }
        }
      }

      // Ensure Admin is always present
      if (!delSet.has(defaultAdmin.email.toLowerCase()) && !userMap.has(defaultAdmin.email.toLowerCase())) {
        userMap.set(defaultAdmin.email.toLowerCase(), defaultAdmin);
      }

      const mergedList = Array.from(userMap.values());
      localStorage.setItem(PRIMARY_USERS_KEY, JSON.stringify(mergedList));
      return mergedList;
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
        const deletedStr = localStorage.getItem(DELETED_USERS_KEY);
        const deleted: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        if (!deleted.includes(cleanEmail)) {
          deleted.push(cleanEmail);
          localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(deleted));
        }

        // Clean out of all user storage keys
        for (const key of PAST_USER_KEYS) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed: AppUser[] = JSON.parse(data);
              const filtered = parsed.filter((u) => u.email?.toLowerCase() !== cleanEmail);
              localStorage.setItem(key, JSON.stringify(filtered));
            } catch {
              // ignore
            }
          }
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
