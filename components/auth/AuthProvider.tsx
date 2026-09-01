"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { UserSync } from "./UserSync";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserSync />
      {children}
    </SessionProvider>
  );
}
