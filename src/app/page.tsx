"use client";

import { useState, useEffect } from "react";
import { Sparkles, ChefHat, Flame, ShoppingBag, ChevronRight, Heart, X, Dices } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const AVAILABLE_TAGS = [
  "Frühstück", "Hauptspeise", "Beilage", "Snack", "Dessert", 
  "Schnell", "Meal Prep", "Vegan", "Vegetarisch", "High Protein", "Low Carb",
  "Italienisch", "Asiatisch", "Mediterran", "Deutsch"
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inspiration Modal State
  const [isInspirationOpen, setIsInspirationOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedRecipe, setSuggestedRecipe] = useState<any>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: recs } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (recs) {
        setRecipes(recs);
        setFavorites(recs.filter(r => r.is_favorite));
      }
    }
    setLoading(false);
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const findInspiration = () => {
    setIsSpinning(true);
    setSuggestedRecipe(null);
    
    setTimeout(() => {
      let filtered = recipes;
      if (selectedTags.length > 0) {
        filtered = recipes.filter(r => r.tags && selectedTags.every(t => r.tags.includes(t)));
      }
      
      if (filtered.length > 0) {
        const random = filtered[Math.floor(Math.random() * filtered.length)];
        setSuggestedRecipe(random);
      } else {
        setSuggestedRecipe({ notFound: true });
      }
      setIsSpinning(false);
    }, 800); // Fake delay for UX
  };

  return (
    <div className="space-y-6 fade-in h-full flex flex-col overflow-hidden">
      <header className="pt-4 shrink-0">
        <h1 className="text-4xl font-extrabold tracking-tight">Guten Appetit!</h1>
        <p className="text-[var(--muted-foreground)] font-medium">Was kochen wir heute?</p>
      </header>

      <section 
        onClick={() => setIsInspirationOpen(true)}
        className="bg-[var(--primary)] text-white p-6 rounded-[28px] shadow-lg ios-active-scale cursor-pointer shrink-0"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles size={20} className="fill-white" />
              Inspiration finden
            </h2>
            <p className="text-white/80 text-sm font-medium">Lass den Zufall entscheiden</p>
          </div>
          <ChevronRight size={24} className="opacity-50" />
        </div>
      </section>

      <div className="flex gap-4 shrink-0">
        <div className="flex-1 bg-[var(--card)] p-4 rounded-[22px] flex items-center gap-3 border border-[var(--border)]/5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <Flame size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Rezepte</p>
            <p className="text-lg font-bold truncate">{recipes.length} gesamt</p>
          </div>
        </div>
        <div className="flex-1 bg-[var(--card)] p-4 rounded-[22px] flex items-center gap-3 border border-[var(--border)]/5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600">
            <Heart size={20} className="fill-pink-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Favoriten</p>
            <p className="text-lg font-bold truncate">{favorites.length} gemerkt</p>
          </div>
        </div>
      </div>

      <section className="space-y-3 flex-1 overflow-hidden flex flex-col min-h-0 pb-4">
        <h2 className="text-xl font-bold tracking-tight px-1 shrink-0">Favoriten</h2>
        <div className="bg-[var(--card)] rounded-[24px] border border-[var(--border)]/10 shadow-sm overflow-y-auto no-scrollbar flex-1 p-2">
          {loading ? (
            <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-[var(--primary)]" /></div>
          ) : favorites.length > 0 ? (
            <div className="space-y-1">
              {favorites.map(f => (
                <div key={f.id} className="p-3 rounded-2xl flex items-center gap-4 ios-active-scale cursor-pointer hover:bg-[var(--muted)]/20">
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-xl flex items-center justify-center text-pink-500 shrink-0">
                    <Heart size={20} className="fill-pink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[16px] truncate">{f.title}</h3>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-tight opacity-80">
                      {f.tags && f.tags.length > 0 ? f.tags.slice(0, 3).join(' • ') : "Favorit"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-[var(--muted-foreground)]">
              <Heart size={40} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">Noch keine Favoriten markiert.</p>
              <p className="text-xs mt-1">Tippe auf das Herz in einem Rezept.</p>
            </div>
          )}
        </div>
      </section>

      {/* Inspiration Modal */}
      {isInspirationOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsInspirationOpen(false)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[85vh] flex flex-col gap-6 fade-in shadow-2xl overflow-hidden">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            
            <div className="flex justify-between items-start shrink-0">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold tracking-tight">Inspiration</h2>
                <p className="text-sm text-[var(--muted-foreground)] font-medium mt-1">Worauf hast du Lust?</p>
              </div>
              <button onClick={() => setIsInspirationOpen(false)} className="w-8 h-8 rounded-full bg-[var(--muted)]/50 flex items-center justify-center text-[var(--muted-foreground)]"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-20">
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map(tag => (
                  <button 
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${
                      selectedTags.includes(tag) 
                        ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md" 
                        : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)]/10"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {suggestedRecipe && (
                <div className="pt-4 border-t border-[var(--border)]/10 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2 mb-3">Vorschlag</h3>
                  
                  {suggestedRecipe.notFound ? (
                    <div className="bg-[var(--card)] p-6 rounded-3xl text-center border border-[var(--border)]/10 shadow-sm">
                      <ChefHat size={40} className="mx-auto mb-2 opacity-20" />
                      <p className="font-bold text-lg">Nichts gefunden</p>
                      <p className="text-sm text-[var(--muted-foreground)]">Für diese Kombination gibt es noch keine Rezepte.</p>
                    </div>
                  ) : (
                    <div className="bg-[var(--card)] p-5 rounded-3xl border border-[var(--border)]/10 shadow-lg">
                      <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center text-[var(--primary)] mb-4"><ChefHat size={28} /></div>
                      <h3 className="font-bold text-xl mb-1">{suggestedRecipe.title}</h3>
                      <p className="text-xs text-[var(--primary)] font-bold uppercase tracking-tight mb-4">
                        {suggestedRecipe.tags?.join(' • ')}
                      </p>
                      <button onClick={() => {
                        setIsInspirationOpen(false);
                        window.location.href = "/recipes";
                      }} className="w-full bg-[var(--muted)]/50 text-[var(--foreground)] py-3 rounded-xl font-bold text-sm">
                        Zum Rezept
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={findInspiration} 
              disabled={isSpinning}
              className="w-full bg-[var(--primary)] text-white py-5 rounded-[24px] font-bold text-lg shadow-xl flex items-center justify-center gap-3 ios-active-scale disabled:opacity-50 shrink-0"
            >
              {isSpinning ? <Loader2 className="animate-spin" /> : <><Dices size={24} /> Rezept würfeln</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
