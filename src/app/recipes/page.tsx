"use client";

import { useState } from "react";
import { Plus, Search as SearchIcon, Filter, X } from "lucide-react";

export default function RecipesPage() {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="pt-8 px-1 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Rezepte</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-lg ios-active-scale"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* Search Bar */}
      <div className="relative group px-1">
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] opacity-50" size={18} />
        <input 
          type="text" 
          placeholder="Rezepte, Zutaten..." 
          className="w-full bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-4 pl-12 pr-12 font-medium focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none shadow-sm"
        />
        <Filter className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--primary)]" size={18} />
      </div>

      {/* Recipe Grid (iOS Style) */}
      <div className="grid grid-cols-2 gap-4 px-1">
        {[
          { title: "Grüne Bowl", cal: 450, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop" },
          { title: "Zucchini-Pasta", cal: 320, img: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=300&h=300&fit=crop" },
          { title: "Lachs Teriyaki", cal: 580, img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=300&fit=crop" },
          { title: "Avocado Toast", cal: 290, img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300&h=300&fit=crop" }
        ].map((recipe, i) => (
          <div key={i} className="group cursor-pointer ios-active-scale">
            <div className="aspect-square rounded-[24px] overflow-hidden shadow-sm relative border border-[var(--border)]/10">
              <img src={recipe.img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                {recipe.cal} kcal
              </div>
            </div>
            <h3 className="mt-3 font-bold text-[15px] px-1">{recipe.title}</h3>
          </div>
        ))}
      </div>

      {/* Add Recipe Modal (iOS Style Sheet) */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] shadow-2xl p-6 space-y-6 animate-in slide-in-from-bottom-full duration-500 ease-out h-[90vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-[var(--muted)] rounded-full mx-auto" onClick={() => setIsAdding(false)} />
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Neues Rezept</h2>
              <button onClick={() => setIsAdding(false)} className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 pb-20">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Titel</label>
                <input type="text" placeholder="Wie heißt dein Gericht?" className="w-full bg-[var(--card)] p-4 rounded-xl border-none outline-none font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Zeit (min)</label>
                  <input type="number" placeholder="20" className="w-full bg-[var(--card)] p-4 rounded-xl border-none outline-none font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Kalorien</label>
                  <input type="number" placeholder="450" className="w-full bg-[var(--card)] p-4 rounded-xl border-none outline-none font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Zutaten</label>
                <div className="bg-[var(--card)] rounded-xl p-4 space-y-3">
                  <p className="text-sm text-[var(--muted-foreground)] text-center py-4">Noch keine Zutaten hinzugefügt</p>
                  <button className="w-full py-3 rounded-lg border-2 border-dashed border-[var(--border)] text-[var(--primary)] font-bold text-sm">+ Zutat hinzufügen</button>
                </div>
              </div>
              <button className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[var(--primary)]/20">Rezept speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
