"use client";

import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Settings, LogOut, 
  ChevronRight, Moon, ShieldCheck,
  Bell, Heart, HelpCircle
} from "lucide-react";

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const sections = [
    {
      title: "Konto",
      items: [
        { icon: User, label: "Profil bearbeiten", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
        { icon: ShieldCheck, label: "Sicherheit", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
      ]
    },
    {
      title: "App",
      items: [
        { icon: Bell, label: "Mitteilungen", color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
        { icon: Heart, label: "Favoriten", color: "text-pink-500", bg: "bg-pink-100 dark:bg-pink-900/30" },
      ]
    }
  ];

  return (
    <div className="space-y-8 fade-in">
      <header className="pt-4">
        <h1 className="text-3xl font-bold tracking-tight px-1">Einstellungen</h1>
      </header>

      {/* User Brief */}
      <div className="bg-[var(--card)] p-4 rounded-2xl flex items-center gap-4 border border-[var(--border)]/10">
        <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-2xl font-bold">
          P
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">Pascal</h2>
          <p className="text-[var(--muted-foreground)] text-sm truncate">pascal@example.com</p>
        </div>
        <ChevronRight size={20} className="text-[var(--muted-foreground)] opacity-30" />
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-4">{section.title}</h3>
            <div className="bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)]/10">
              {section.items.map((item, i) => (
                <button 
                  key={item.label}
                  className={`w-full flex items-center gap-4 p-4 ios-active-scale transition-colors hover:bg-[var(--muted)]/20 ${
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
          </div>
        ))}

        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-4">Anzeige</h3>
          <div className="bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)]/10">
            <div className="flex items-center gap-4 p-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                <Moon size={18} />
              </div>
              <span className="flex-1 text-left font-semibold">Dunkelmodus</span>
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`w-11 h-6 rounded-full transition-all relative ${theme === 'dark' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-[var(--card)] rounded-2xl p-4 flex items-center gap-4 ios-active-scale border border-[var(--border)]/10 text-red-500 font-bold justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          <LogOut size={18} />
          Abmelden
        </button>
      </div>
    </div>
  );
}
