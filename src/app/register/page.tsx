"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ChevronRight, Apple, AlertCircle, User } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/login?message=Prüfe deine E-Mails zur Bestätigung.");
    }
  };

  return (
    <div className="h-full flex flex-col justify-center px-4 space-y-12 animate-in fade-in duration-700 overflow-hidden">
      <header className="text-center space-y-2 shrink-0">
        <div className="w-20 h-20 bg-[var(--primary)] rounded-[22px] mx-auto flex items-center justify-center text-white shadow-xl shadow-[var(--primary)]/20 mb-6">
          <User size={40} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Konto erstellen</h1>
        <p className="text-[var(--muted-foreground)] font-medium">Starte jetzt mit deinem Rezept-Manager</p>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium shrink-0">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form className="space-y-4 shrink-0" onSubmit={handleRegister}>
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">E-Mail</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beispiel.de" 
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 Zeichen" 
              required
              minLength={6}
              className="w-full bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-4 pl-12 pr-4 font-medium outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all shadow-sm"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[var(--primary)]/20 flex items-center justify-center gap-2 ios-active-scale mt-4 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Registrieren <ChevronRight size={20} /></>
          )}
        </button>
      </form>

      <footer className="text-center space-y-4 shrink-0">
        <p className="text-[var(--muted-foreground)] font-medium text-sm">
          Bereits ein Konto? <Link href="/login" className="text-[var(--primary)] font-bold">Jetzt anmelden</Link>
        </p>
      </footer>
    </div>
  );
}
