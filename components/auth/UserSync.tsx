"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { UserStore } from "@/lib/admin/user-store";

export function UserSync() {
  const { data: session, status } = useSession();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const email = session.user.email;
      if (syncedRef.current === email) return;
      syncedRef.current = email;

      // Upsert to client store
      UserStore.upsertUser({
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      });

      // Upsert to backend server store
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }),
      }).catch((err) => console.warn("User sync log error:", err));
    }
  }, [session, status]);

  return null;
}
