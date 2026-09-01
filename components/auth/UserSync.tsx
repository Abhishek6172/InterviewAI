"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { UserStore } from "@/lib/admin/user-store";
import { SessionManager } from "@/lib/interview/session-manager";

export function UserSync() {
  const { data: session, status } = useSession();
  const lastSyncRef = useRef<number>(0);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const now = Date.now();
      // Sync every 30 seconds or on first authenticated mount
      if (now - lastSyncRef.current < 30000) return;
      lastSyncRef.current = now;

      const history = SessionManager.getSessionHistory();
      const sessionRecords = history.map((s) => ({
        id: s.id,
        role: s.options.role,
        difficulty: s.options.difficulty,
        experienceLevel: s.options.experienceLevel,
        overallScore: s.scorecard?.overallScore,
        createdAt: s.createdAt || s.startedAt || s.completedAt,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        questionCount: s.questions ? s.questions.length : 0,
        scorecard: s.scorecard,
        resumeFileName: s.options.resumeFileName,
      }));

      // Upsert locally
      UserStore.upsertUser({
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        sessions: sessionRecords,
      });

      // Sync with server API
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          sessions: sessionRecords,
        }),
      }).catch((err) => console.warn("User sync server notice:", err));
    }
  }, [session, status]);

  return null;
}
