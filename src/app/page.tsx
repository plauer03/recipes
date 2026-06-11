"use client";

import { useState, useEffect } from "react";
import { Sparkles, ChefHat, Flame, ShoppingBag, ChevronRight, Heart, X, Dices, Loader2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import RecipeDetailModal from "@/components/RecipeDetailModal";

const AVAILABLE_TAGS = [
  "Frühstück", "Hauptspeise", "Beilage", "Snack", "Dessert", 
  "Schnell", "Meal Prep", "Vegan", "Vegetarisch", "High Protein", "Low Carb",
  "Italienisch", "Asiatisch", "Mediterran", "Deutsch"
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inspiration Modal State
  const [isInspirationOpen, setIsInspirationOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedRecipe, setSuggestedRecipe] = useState<any>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [dailyRecommendation, setDailyRecommendation] = useState<any>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      // 1. Fetch own recipes & favorites
      const { data: recs } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (recs) {
        setRecipes(recs);
        setFavorites(recs.filter(r => r.is_favorite));
        generateDailyRecommendation(recs);
      }
// 2. Fetch Feed (own + followed users' recipes)
const { data: following } = await supabase
  .from('follows')
  .select('following_id')
  .eq('follower_id', user.id);

const idsToShow = [user.id];
if (following && following.length > 0) {
  idsToShow.push(...following.map(f => f.following_id));
}

const { data: feedRecs } = await supabase
  .from('recipes')
  .select('*, profiles:created_by(name, avatar_url)')
  .in('created_by', idsToShow)
  .order('created_at', { ascending: false })
  .limit(15);

if (feedRecs) setFeed(feedRecs);

    }
    setLoading(false);
  }

  const generateDailyRecommendation = (allRecipes: any[]) => {
    const hour = new Date().getHours();
    let type = "Hauptspeise";
    if (hour >= 5 && hour < 11) type = "Frühstück";
    else if (hour >= 11 && hour < 15) type = "Hauptspeise";
    else if (hour >= 15 && hour < 18) type = "Snack";
    else type = "Hauptspeise";

    const possible = allRecipes.filter(r => r.tags?.includes(type));
    if (possible.length > 0) {
      setDailyRecommendation({ recipe: possible[Math.floor(Math.random() * possible.length)], type });
    } else if (allRecipes.length > 0) {
      setDailyRecommendation({ recipe: allRecipes[Math.floor(Math.random() * allRecipes.length)], type: "Empfehlung" });
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
        setSuggestedRecipe(filtered[Math.floor(Math.random() * filtered.length)]);
      } else {
        setSuggestedRecipe({ notFound: true });
      }
      setIsSpinning(false);
    }, 800);
  };

  async function toggleFavorite(recipe: any) {
    const newStatus = !recipe.is_favorite;
    setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...r, is_favorite: newStatus } : r));
    setFavorites(prev => {
      if (newStatus) {
        const fullRecipe = recipes.find(r => r.id === recipe.id);
        return [{ ...fullRecipe, is_favorite: true }, ...prev];
      }
      return prev.filter(r => r.id !== recipe.id);
    });
    await supabase.from('recipes').update({ is_favorite: newStatus }).eq('id', recipe.id);
  }

  return (
    <div className="space-y-6 fade-in h-full flex flex-col overflow-hidden">
      <header className="pt-4 shrink-0 px-1 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Guten Appetit!</h1>
      </header>

      {/* Daily Recommendation */}
      <section className="space-y-3 px-1 shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">
          <Clock size={12} /> {dailyRecommendation?.type || "Empfehlung"}
        </div>
        {dailyRecommendation ? (
          <div onClick={() => setSelectedRecipe(dailyRecommendation.recipe)} className="bg-[var(--card)] p-4 rounded-[28px] border border-[var(--border)]/5 shadow-sm flex items-center gap-4 ios-active-scale cursor-pointer">
            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center text-[var(--primary)] shrink-0"><ChefHat size={32} /></div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">{dailyRecommendation.recipe.title}</h3>
              <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-tight opacity-70 truncate">{dailyRecommendation.recipe.tags?.join(' • ')}</p>
            </div>
            <ChevronRight size={20} className="text-[var(--muted-foreground)] opacity-20" />
          </div>
        ) : (
          <div className="bg-[var(--card)] p-6 rounded-[28px] text-center border border-dashed border-[var(--border)] opacity-30"><p className="text-xs font-bold uppercase tracking-widest">Lege Rezepte an</p></div>
        )}
      </section>

      {/* Compact Inspiration Trigger */}
      <section onClick={() => setIsInspirationOpen(true)} className="bg-[var(--primary)] text-white p-4 rounded-2xl shadow-lg ios-active-scale cursor-pointer shrink-0 mx-1 flex items-center gap-4">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0"><Sparkles size={20} className="fill-white" /></div>
        <div className="flex-1"><h2 className="text-[16px] font-bold">Inspiration finden</h2><p className="text-white/70 text-[11px] font-medium leading-none">Lass den Zufall entscheiden</p></div>
        <ChevronRight size={20} className="opacity-40" />
      </section>

      {/* Simple Stats */}
      <div className="flex gap-4 shrink-0 px-1">
        <div className="flex-1 bg-[var(--card)] p-4 rounded-2xl flex items-center gap-3 border border-[var(--border)]/5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <Flame size={20} />
          </div>
          <p className="text-xl font-black">{recipes.length}</p>
        </div>
        <div className="flex-1 bg-[var(--card)] p-4 rounded-2xl flex items-center gap-3 border border-[var(--border)]/5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600">
            <Heart size={20} className="fill-pink-600" />
          </div>
          <p className="text-xl font-black">{favorites.length}</p>
        </div>
      </div>

      {/* Feed Section */}
      <section className="space-y-3 flex-1 overflow-hidden flex flex-col min-h-0 pb-4 px-1">
        <h2 className="text-xl font-bold tracking-tight px-1 shrink-0">Aktivität</h2>
        <div className="bg-[var(--card)] rounded-[24px] border border-[var(--border)]/10 shadow-sm overflow-y-auto no-scrollbar flex-1 p-2">
          {loading ? (
            <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-[var(--primary)]" /></div>
          ) : feed.length > 0 ? (
            <div className="space-y-1">
              {feed.map(item => (
                <div key={item.id} onClick={() => setSelectedRecipe(item)} className="p-3 rounded-2xl flex items-center gap-4 ios-active-scale cursor-pointer hover:bg-[var(--muted)]/20 transition-colors">
                  <div className="w-12 h-12 bg-[var(--primary)]/5 dark:bg-white/5 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-[var(--border)]/5">
                    {item.profiles?.avatar_url ? (
                      <img src={item.profiles.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <ChefHat size={20} className="text-[var(--primary)] opacity-40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[16px] truncate flex items-center gap-2">
                       {item.title}
                       {item.created_by === user?.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                    </h3>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-tight">
                       {item.created_by === user?.id ? "Von dir" : `von ${item.profiles?.name || "Freund"}`}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-[var(--muted-foreground)] opacity-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-[var(--muted-foreground)] space-y-2 grayscale opacity-40">
              <ChefHat size={40} className="mx-auto" />
              <p className="text-xs font-bold uppercase tracking-widest">Noch keine Aktivität</p>
            </div>
          )}
        </div>
      </section>

      {/* Inspiration Modal */}
      {isInspirationOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsInspirationOpen(false)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[90dvh] flex flex-col gap-6 fade-in shadow-2xl overflow-hidden">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-start shrink-0">
              <div className="flex-1"><h2 className="text-2xl font-bold tracking-tight">Inspiration</h2><p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest mt-1">Worauf hast du Lust?</p></div>
              <button onClick={() => setIsInspirationOpen(false)} className="w-8 h-8 rounded-full bg-[var(--muted)]/50 flex items-center justify-center text-[var(--muted-foreground)]"><X size={18} /></button>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {AVAILABLE_TAGS.map(tag => (
                <button key={tag} onClick={() => {if(selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t=>t!==tag)); else setSelectedTags([...selectedTags, tag])}} className={`px-3 py-1.5 rounded-full text-[13px] font-bold transition-colors border ${selectedTags.includes(tag) ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md" : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)]/10"}`}>{tag}</button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {suggestedRecipe && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  {suggestedRecipe.notFound ? (<div className="bg-[var(--card)] p-6 rounded-3xl text-center border border-[var(--border)]/10 opacity-40"><p className="font-bold">Kein Treffer</p></div>) : (
                    <div className="bg-[var(--card)] p-5 rounded-3xl border border-[var(--border)]/10 shadow-lg ios-active-scale cursor-pointer" onClick={() => {setIsInspirationOpen(false); setSelectedRecipe(suggestedRecipe);}}>
                      <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center text-[var(--primary)] mb-4"><ChefHat size={24} /></div>
                      <h3 className="font-bold text-xl mb-1">{suggestedRecipe.title}</h3>
                      <p className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-tight">{suggestedRecipe.tags?.join(' • ')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button onClick={findInspiration} disabled={isSpinning} className="w-full bg-[var(--primary)] text-white py-5 rounded-[24px] font-bold text-lg shadow-xl flex items-center justify-center gap-3 ios-active-scale disabled:opacity-50 shrink-0 mt-auto">{isSpinning ? <Loader2 className="animate-spin" /> : <><Dices size={24} /> Rezept würfeln</>}</button>
          </div>
        </div>
      )}

      {selectedRecipe && (
        <RecipeDetailModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}
