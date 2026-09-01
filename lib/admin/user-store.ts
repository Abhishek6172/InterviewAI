export interface AppUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  firstSeenAt: string;
  lastLoginAt: string;
  interviewsCompleted?: number;
  lastRole?: string;
}

const USERS_STORAGE_KEY = "interviewai_registered_users";

// In-memory server store
let serverUsers: AppUser[] = [
  {
    id: "admin_1",
    name: "Abhishek Kumar Das Pattanayak",
    email: "abhishekkumardaspattanayak444@gmail.com",
    firstSeenAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    interviewsCompleted: 1,
    lastRole: "Product Manager",
  },
];

export class UserStore {
  public static upsertUser(user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    lastRole?: string;
  }): AppUser | null {
    if (!user.email) return null;

    const email = user.email.trim().toLowerCase();
    const existingIndex = serverUsers.findIndex((u) => u.email.toLowerCase() === email);

    const now = new Date().toISOString();
    let updatedUser: AppUser;

    if (existingIndex >= 0) {
      updatedUser = {
        ...serverUsers[existingIndex],
        name: user.name || serverUsers[existingIndex].name,
        image: user.image || serverUsers[existingIndex].image,
        lastLoginAt: now,
        lastRole: user.lastRole || serverUsers[existingIndex].lastRole,
      };
      serverUsers[existingIndex] = updatedUser;
    } else {
      updatedUser = {
        id: user.id || `user_${Date.now()}`,
        name: user.name || "Candidate",
        email,
        image: user.image || undefined,
        firstSeenAt: now,
        lastLoginAt: now,
        interviewsCompleted: 0,
        lastRole: user.lastRole || "Software Engineer",
      };
      serverUsers.unshift(updatedUser);
    }

    // Also persist to localStorage on client
    if (typeof window !== "undefined") {
      try {
        const local = this.getClientUsers();
        const lIndex = local.findIndex((u) => u.email.toLowerCase() === email);
        if (lIndex >= 0) {
          local[lIndex] = updatedUser;
        } else {
          local.unshift(updatedUser);
        }
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(local));
      } catch (err) {
        console.warn("Error saving users to client localStorage:", err);
      }
    }

    return updatedUser;
  }

  public static incrementInterviewCount(email: string): void {
    const user = serverUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.interviewsCompleted = (user.interviewsCompleted || 0) + 1;
    }

    if (typeof window !== "undefined") {
      try {
        const local = this.getClientUsers();
        const lUser = local.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (lUser) {
          lUser.interviewsCompleted = (lUser.interviewsCompleted || 0) + 1;
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(local));
        }
      } catch {
        // ignore
      }
    }
  }

  public static getServerUsers(): AppUser[] {
    return serverUsers;
  }

  public static getClientUsers(): AppUser[] {
    if (typeof window === "undefined") return serverUsers;
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(serverUsers));
        return serverUsers;
      }
      return JSON.parse(data);
    } catch {
      return serverUsers;
    }
  }

  public static deleteUser(email: string): void {
    const cleanEmail = email.trim().toLowerCase();
    serverUsers = serverUsers.filter((u) => u.email.toLowerCase() !== cleanEmail);

    if (typeof window !== "undefined") {
      try {
        const local = this.getClientUsers().filter((u) => u.email.toLowerCase() !== cleanEmail);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(local));
      } catch {
        // ignore
      }
    }
  }
}
