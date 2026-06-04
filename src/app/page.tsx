import { Plus, Search, Flame } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Moin!</h1>
          <p className="text-[var(--muted-foreground)]">Was kochen wir heute?</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white shadow-lg">
          <UserIcon />
        </div>
      </header>

      {/* Quick Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
        <input 
          type="text" 
          placeholder="Rezepte suchen..." 
          className="w-full bg-[var(--muted)] border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[var(--primary)] transition-all outline-none"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--card)] p-4 rounded-2xl shadow-card flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-sm">
            <Flame size={16} />
            <span>Heute</span>
          </div>
          <div className="text-2xl font-black">1.420 <span className="text-sm font-normal text-[var(--muted-foreground)]">kcal</span></div>
        </div>
        <div className="bg-[var(--card)] p-4 rounded-2xl shadow-card flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-sm">
            <Plus size={16} />
            <span>Einkäufe</span>
          </div>
          <div className="text-2xl font-black">12 <span className="text-sm font-normal text-[var(--muted-foreground)]">Items</span></div>
        </div>
      </div>

      {/* Recent Recipes */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold">Zuletzt gekocht</h2>
          <button className="text-[var(--primary)] text-sm font-semibold">Alle anzeigen</button>
        </div>
        
        <div className="space-y-3">
          {[
            { title: "Grüne Bowl mit Quinoa", cal: 450, time: "20 min" },
            { title: "Zucchini-Pasta", cal: 320, time: "15 min" }
          ].map((recipe, i) => (
            <div key={i} className="bg-[var(--card)] p-4 rounded-2xl shadow-card flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-lg">{recipe.title}</span>
                <span className="text-sm text-[var(--muted-foreground)]">{recipe.cal} kcal • {recipe.time}</span>
              </div>
              <div className="w-12 h-12 bg-[var(--muted)] rounded-xl flex items-center justify-center">
                <UtensilsCrossed size={20} className="text-[var(--primary)]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAB - Floating Action Button for adding something new */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-10 lg:absolute lg:bottom-24 lg:right-6">
        <Plus size={28} />
      </button>
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  );
}

import { UtensilsCrossed } from "lucide-react";
