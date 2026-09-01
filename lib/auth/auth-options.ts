import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      checks: ["none"],
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "interviewai-default-secret-production-key",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Prioritize configured NEXTAUTH_URL or Vercel URL
      const appBase = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : baseUrl);
      
      // Relative path callback (e.g. /profile, /interview/setup)
      if (url.startsWith("/")) {
        return `${appBase}${url}`;
      }
      
      try {
        const urlObj = new URL(url);
        const baseObj = new URL(appBase);
        if (urlObj.hostname === baseObj.hostname || urlObj.origin === baseObj.origin) {
          return url;
        }
      } catch {
        // invalid URL
      }
      
      return appBase;
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
};
