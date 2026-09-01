"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  History,
  ShieldCheck,
  Award,
} from "lucide-react";

interface UserMenuProps {
  onSignInRequired?: () => void;
}

export function UserMenu({ onSignInRequired }: UserMenuProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-purple-500/20 animate-pulse border border-purple-500/30" />
    );
  }

  if (!session || !session.user) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          if (onSignInRequired) {
            onSignInRequired();
          } else {
            signIn("google");
          }
        }}
        className="gap-2 text-xs border-purple-500/30 hover:border-purple-500/50 bg-purple-950/20 hover:bg-purple-900/30 text-purple-200 font-semibold shadow-sm"
      >
        {/* Google G Icon */}
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign in with Google</span>
      </Button>
    );
  }

  const user = session.user;
  const firstName = user.name ? user.name.split(" ")[0] : "Candidate";
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CA";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer shadow-sm hover:shadow-purple-500/20"
      >
        {/* Candidate Profile Picture (PFP) with Google Referrer Fix */}
        {user.image && !imageError ? (
          <img
            src={user.image}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => setImageError(true)}
            className="w-7 h-7 rounded-full object-cover border border-purple-400/60 shadow-sm"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-purple-400/60 shrink-0">
            {initials}
          </div>
        )}

        {/* First Name Display */}
        <span className="text-xs font-bold text-white max-w-[120px] truncate">
          {firstName}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0e101a] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
          {/* User Details */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 mb-1">
            <div className="flex items-center gap-2.5">
              {user.image && !imageError ? (
                <img
                  src={user.image}
                  alt=""
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={() => setImageError(true)}
                  className="w-9 h-9 rounded-full object-cover border border-purple-500/40"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>Google OAuth Verified</span>
            </div>
          </div>

          {/* Navigation Links */}
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <User className="w-4 h-4 text-purple-400" />
            <span>Candidate Profile & Stats</span>
          </Link>

          <Link
            href="/analytics"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <History className="w-4 h-4 text-blue-400" />
            <span>Telemetry & Form Responses</span>
          </Link>

          <div className="pt-1 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
