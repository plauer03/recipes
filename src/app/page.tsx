"use client";

import { useState } from "react";
import { Sparkles, ChefHat, Timer, Flame, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  const categories = ["Alle", "Frühstück", "Mittag", "Abend", "Snacks"];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* iOS Style Large Title */}
      <header className="pt-8">
        <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Donnerstag, 4. Juni</span>
        <h1 className="text-4xl font-extrabold tracking-tight mt-1">Guten Appetit</h1>
      </header>

      {/* "What should I cook?" - Smart Trigger */}
      <section 
        className="relative overflow-hidden bg-[var(--primary)] text-white p-6 rounded-[24px] shadow-lg ios-active-scale cursor-pointer"
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 2000);
        }}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles size={20} className="fill-white" />
              Was koche ich heute?
            </h2>
            <p className="text-white/80 text-sm font-medium">Lass dich inspirieren</p>
          </div>
          <ChevronRight size={24} className="opacity-50" />
        </div>
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full blur-2xl -ml-5 -mb-5" />
      </section>

      {/* Stats - Small & Clean */}
      <div className="flex gap-4">
        <div className="flex-1 bg-[var(--card)] p-4 rounded-[20px] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Verbraucht</p>
            <p className="text-lg font-bold tracking-tight">1.420 <span className="text-[10px] font-medium opacity-50 uppercase">kcal</span></p>
          </div>
        </div>
        <div className="flex-1 bg-[var(--card)] p-4 rounded-[20px] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
            <ChefHat size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Rezepte</p>
            <p className="text-lg font-bold tracking-tight">48 <span className="text-[10px] font-medium opacity-50 uppercase">Gesamt</span></p>
          </div>
        </div>
      </div>

      {/* Horizontal Category Scroll */}
      <section className="space-y-4">
        <div className="flex overflow-x-auto no-scrollbar gap-2 px-1">
          {categories.map((cat) => (
            <button 
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                cat === "Alle" 
                ? "bg-[var(--foreground)] text-[var(--background)] shadow-md" 
                : "bg-[var(--card)] text-[var(--foreground)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Recipes - iOS List Style */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xl font-bold tracking-tight">Zuletzt gekocht</h2>
          <button className="text-[var(--primary)] text-sm font-semibold active:opacity-50">Alle anzeigen</button>
        </div>
        
        <div className="bg-[var(--card)] rounded-[20px] overflow-hidden border border-[var(--border)]/10">
          {[
            { title: "Grüne Bowl mit Quinoa", cal: 450, time: "20 min", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop" },
            { title: "Zucchini-Pasta mit Pesto", cal: 320, time: "15 min", img: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=200&h=200&fit=crop" },
            { title: "Lachs Teriyaki", cal: 580, time: "25 min", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop" }
          ].map((recipe, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-4 p-4 ios-active-scale cursor-pointer ${
                i !== 0 ? "border-t border-[var(--border)]/20" : ""
              }`}
            >
              <img src={recipe.img} alt="" className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[16px] truncate">{recipe.title}</h3>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-[12px] text-[var(--muted-foreground)]">
                    <Flame size={12} /> {recipe.cal} kcal
                  </span>
                  <span className="flex items-center gap-1 text-[12px] text-[var(--muted-foreground)]">
                    <Timer size={12} /> {recipe.time}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--muted-foreground)] opacity-30" />
            </div>
          ))}
        </div>
      </section>

      {/* Loading Overlay (iOS Style) */}
      {loading && (
        <div className="fixed inset-0 z-[100] glass flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-[var(--card)] p-8 rounded-[32px] shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <p className="font-bold tracking-tight">Kriterien prüfen...</p>
          </div>
        </div>
      )}
    </div>
  );
}
