"use client";

import { useState, useEffect } from "react";
import { Search as SearchIcon, Users, ChefHat, ChevronRight, Loader2, UserPlus, UserCheck, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import RecipeDetailModal from "@/components/RecipeDetailModal";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'recipes' | 'people'>('recipes');
  const [recipeResults, setRecipeResults] = useState<any[]>([]);
  const [peopleResults, setPeopleResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchFollowing();
  }, []);

  async function fetchFollowing() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
      if (data) setFollowingIds(data.map(f => f.following_id));
    }
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.length < 2) return;

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (activeTab === 'recipes') {
      const { data } = await supabase
        .from('recipes')
        .select('*')
        .ilike('title', `%${query}%`)
        .limit(20);
      setRecipeResults(data || []);
    } else {
      // Search people by name or email
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', user?.id)
        .limit(20);
      setPeopleResults(data || []);
    }
    setLoading(false);
  };

  const toggleFollow = async (personId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isFollowing = followingIds.includes(personId);
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', personId);
      setFollowingIds(prev => prev.filter(id => id !== personId));
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: personId });
      setFollowingIds(prev => [...prev, personId]);
    }
  };

  async function toggleFavorite(recipe: any) {
    const newStatus = !recipe.is_favorite;
    setRecipeResults(prev => prev.map(r => r.id === recipe.id ? { ...r, is_favorite: newStatus } : r));
    await supabase.from('recipes').update({ is_favorite: newStatus }).eq('id', recipe.id);
  }

  return (
    <div className="space-y-6 fade-in h-full flex flex-col overflow-hidden">
      <header className="pt-4 shrink-0 px-1">
        <h1 className="text-3xl font-bold tracking-tight">Entdecken</h1>
      </header>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative shrink-0 px-1">
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
        <input 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={activeTab === 'recipes' ? "Rezepte finden..." : "Freunde suchen (Name/Email)..."} 
          className="w-full bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-4 pl-12 pr-4 font-bold outline-none shadow-sm"
        />
      </form>

      {/* Tabs */}
      <div className="flex bg-[var(--card)] p-1 rounded-2xl border border-[var(--border)]/10 mx-1 shrink-0">
        <button 
          onClick={() => setActiveTab('recipes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'recipes' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--muted-foreground)]'}`}
        >
          <ChefHat size={16} /> Rezepte
        </button>
        <button 
          onClick={() => setActiveTab('people')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'people' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--muted-foreground)]'}`}
        >
          <Users size={16} /> Freunde
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 px-1">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[var(--primary)]" /></div>
        ) : activeTab === 'recipes' ? (
          recipeResults.length > 0 ? (
            <div className="space-y-3">
              {recipeResults.map(r => (
                <div key={r.id} onClick={() => setSelectedRecipe(r)} className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/5 shadow-sm flex items-center gap-4 ios-active-scale cursor-pointer">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center text-[var(--primary)] shrink-0"><ChefHat size={24} /></div>
                  <div className="flex-1 truncate">
                    <h3 className="font-bold text-[17px] flex items-center gap-2">
                      {r.title}
                      {r.is_favorite && <Heart size={14} className="fill-pink-500 text-pink-500" />}
                    </h3>
                  </div>
                  <ChevronRight size={18} className="text-[var(--muted-foreground)] opacity-20" />
                </div>
              ))}
            </div>
          ) : query.length > 0 && <p className="py-20 text-center text-sm font-bold opacity-30">Keine Rezepte gefunden</p>
        ) : (
          peopleResults.length > 0 ? (
            <div className="space-y-3">
              {peopleResults.map(p => (
                <div key={p.id} className="bg-[var(--card)] p-4 rounded-3xl border border-[var(--border)]/5 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xl font-black uppercase overflow-hidden shrink-0">
                    {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[17px] truncate">{p.name || "Nutzer"}</h3>
                    <p className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-tight truncate">{p.email}</p>
                  </div>
                  <button 
                    onClick={() => toggleFollow(p.id)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${followingIds.includes(p.id) ? 'bg-[var(--muted)]/50 text-[var(--foreground)]' : 'bg-[var(--primary)] text-white shadow-md'}`}
                  >
                    {followingIds.includes(p.id) ? <UserCheck size={18} /> : <UserPlus size={18} />}
                  </button>
                </div>
              ))}
            </div>
          ) : query.length > 0 && <p className="py-20 text-center text-sm font-bold opacity-30">Niemanden gefunden</p>
        )}
      </div>

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
