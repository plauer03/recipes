"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ChevronRight, Apple } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 space-y-12 animate-in fade-in duration-700">
      <header className="text-center space-y-2">
        <div className="w-20 h-20 bg-[var(--primary)] rounded-[22px] mx-auto flex items-center justify-center text-white shadow-xl shadow-[var(--primary)]/20 mb-6">
          <Apple size={40} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Willkommen</h1>
        <p className="text-[var(--muted-foreground)] font-medium">Melde dich an, um fortzufahren</p>
      </header>

      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">E-Mail</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
            <input 
              type="email" 
              placeholder="name@beispiel.de" 
              className="w-full bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-4 pl-12 pr-4 font-medium outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Passwort</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-4 pl-12 pr-4 font-medium outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all shadow-sm"
            />
          </div>
        </div>

        <button 
          type="button"
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              window.location.href = "/";
            }, 1500);
          }}
          className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[var(--primary)]/20 flex items-center justify-center gap-2 ios-active-scale mt-4"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Anmelden <ChevronRight size={20} /></>
          )}
        </button>
      </form>

      <footer className="text-center space-y-4">
        <p className="text-[var(--muted-foreground)] font-medium text-sm">
          Noch kein Konto? <Link href="/register" className="text-[var(--primary)] font-bold">Jetzt registrieren</Link>
        </p>
        <button className="text-[var(--muted-foreground)] font-medium text-xs uppercase tracking-widest opacity-50">Passwort vergessen?</button>
      </footer>
    </div>
  );
}
