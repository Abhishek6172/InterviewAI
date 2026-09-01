import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { NextRequest } from "next/server";

// Fallback to production Vercel URL
const PRODUCTION_URL = "https://interview-ai-five-weld.vercel.app";

async function authHandler(req: NextRequest, ctx: any) {
  // Dynamically resolve request host to avoid localhost redirect on Vercel/mobile
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");

  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    process.env.NEXTAUTH_URL = `${proto}://${host}`;
  } else if (!process.env.NEXTAUTH_URL || (process.env.NODE_ENV === "production" && process.env.NEXTAUTH_URL.includes("localhost"))) {
    process.env.NEXTAUTH_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : PRODUCTION_URL;
  }

  return NextAuth(authOptions)(req, ctx);
}

export { authHandler as GET, authHandler as POST };
