import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "InterviewAI - Adaptive AI Avatar Mock Interview Platform",
  description:
    "Master technical, behavioral, and system design interviews with an interactive AI avatar interviewer that adapts in real-time.",
  keywords: ["AI interview practice", "mock interview avatar", "tech interview prep", "AI interviewer"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.className} min-h-screen text-slate-100 flex flex-col justify-between selection:bg-purple-500/30 selection:text-purple-200`}>
        {/* Dynamic Aurora Ambient Background */}
        <div className="aurora-mesh" />
        <div className="fine-grid" />

        <main className="flex-1 flex flex-col relative z-10">{children}</main>

        <footer className="w-full py-5 border-t border-white/5 text-center text-xs text-slate-500 px-4 relative z-10 backdrop-blur-sm">
          <p>
            InterviewAI &bull; AI-Powered Mock Interview Platform &bull; Transparent AI Interaction
          </p>
        </footer>
      </body>
    </html>
  );
}
