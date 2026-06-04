"use client";

import { useState } from "react";
import { User, Mail, Settings, LogOut, ChevronRight, Moon, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const menuItems = [
    { icon: User, label: "Persönliche Daten", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { icon: ShieldCheck, label: "Sicherheit", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
    { icon: Settings, label: "Einstellungen", color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800" },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="pt-8 px-1">
        <h1 className="text-4xl font-extrabold tracking-tight">Profil</h1>
      </header>

      {/* Profile Card */}
      <div className="bg-[var(--card)] p-6 rounded-[24px] shadow-sm flex items-center gap-4 border border-[var(--border)]/10">
        <div className="w-20 h-20 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-3xl font-bold">
          P
        </div>
        <div>
          <h2 className="text-xl font-bold">Pascal</h2>
          <p className="text-[var(--muted-foreground)] text-sm flex items-center gap-1">
            <Mail size={14} /> pascal@example.com
          </p>
        </div>
      </div>

      {/* iOS Style List Group */}
      <div className="space-y-6">
        <div className="bg-[var(--card)] rounded-[20px] overflow-hidden border border-[var(--border)]/10">
          {menuItems.map((item, i) => (
            <button 
              key={item.label}
              className={`w-full flex items-center gap-4 p-4 ios-active-scale ${
                i !== 0 ? "border-t border-[var(--border)]/20" : ""
              }`}
            >
              <div className={`w-8 h-8 rounded-lg ${item.bg} ${item.color} flex items-center justify-center`}>
                <item.icon size={18} />
              </div>
              <span className="flex-1 text-left font-semibold">{item.label}</span>
              <ChevronRight size={18} className="text-[var(--muted-foreground)] opacity-30" />
            </button>
          ))}
        </div>

        <div className="bg-[var(--card)] rounded-[20px] overflow-hidden border border-[var(--border)]/10">
          <div className="flex items-center gap-4 p-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
              <Moon size={18} />
            </div>
            <span className="flex-1 text-left font-semibold">Dark Mode</span>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <button className="w-full bg-[var(--card)] rounded-[20px] p-4 flex items-center gap-4 ios-active-scale border border-[var(--border)]/10 text-red-500 font-bold justify-center">
          <LogOut size={18} />
          Abmelden
        </button>
      </div>
    </div>
  );
}
