"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { ArrowLeft, User } from "lucide-react";

/**
 * Minimal solid top bar shown on app-shell pages (account, login, orders).
 * Always opaque — no scroll-state dependency.
 */
export default function AppShellHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user?.photoURL]);

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-[#0A0A0A] border-b border-white/10 text-white z-50">
      {/* Logo */}
      <Link href="/" className="flex flex-col items-start leading-none group">
        <div className="text-2xl font-black font-outfit tracking-tighter text-white flex items-center">
          <span className="text-brand-accent group-hover:scale-110 transition-transform origin-bottom">A</span>VEON
        </div>
        <span className="text-[8px] font-bold tracking-[0.2em] opacity-50 mt-0.5 text-gray-400 uppercase">
          Seating Systems
        </span>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Go Back
        </button>

        {user && (
          <div className="flex items-center gap-2">
            {user.photoURL && user.photoURL.trim() !== "" && !imgError ? (
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-brand-accent/30"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
                <User className="w-4 h-4" />
              </div>
            )}
            <span className="hidden sm:block text-xs font-bold text-white truncate max-w-[120px]">
              {user.displayName || user.email?.split("@")[0]}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
