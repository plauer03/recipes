"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ChefHat, Heart, Search, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  prep_time?: number;
  cook_time?: number;
  difficulty?: string;
  is_favorite?: boolean;
  created_by: string;
  tags?: string[];
  profiles?: { name?: string; avatar_url?: string };
  [key: string]: any;
}

const AVAILABLE_TAGS = [
  "Frühstück", "Hauptspeise", "Beilage", "Snack", "Dessert", 
  "Schnell", "Meal Prep", "Vegan", "Vegetarisch", "High Protein", "Low Carb",
  "Italienisch", "Asiatisch", "Mediterran", "Deutsch"
];

export default function Recipes() {
  const router = useRouter();
  const supabase = createClient();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Alle');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      // Fetch following list
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      
      const idsToShow = [user.id];
      if (following && following.length > 0) {
        idsToShow.push(...following.map(f => f.following_id));
      }

      const { data: recs } = await supabase
        .from('recipes')
        .select('*, profiles:created_by(name, avatar_url)')
        .in('created_by', idsToShow)
        .order('created_at', { ascending: false });
      
      if (recs) {
        setRecipes(recs);
      }
    }
    setLoading(false);
  }

  async function toggleFavorite(id: string) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    
    const newStatus = !recipe.is_favorite;
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, is_favorite: newStatus } : r));
    await supabase.from('recipes').update({ is_favorite: newStatus }).eq('id', id);
  }

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'Alle' || (recipe.tags && recipe.tags.includes(activeCategory));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-10 min-h-full" style={{ fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Sticky search */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl px-5 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Rezepte suchen…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-10 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-foreground/20 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto no-scrollbar border-b border-border/50">
        <button
          onClick={() => setActiveCategory('Alle')}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            activeCategory === 'Alle'
              ? 'bg-foreground text-background shadow-md'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          Alle
        </button>
        {AVAILABLE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveCategory(tag)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === tag
                ? 'bg-foreground text-background shadow-md'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Recipe list (Horizontal Cards) */}
      <div className="px-5 flex flex-col gap-3 pt-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-foreground" /></div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border mt-2">
            <ChefHat className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
            <p className="text-muted-foreground text-sm font-medium">Keine Rezepte gefunden</p>
          </div>
        ) : (
          filteredRecipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => router.push(`/recipes/${recipe.id}`)}
              className="w-full flex gap-3 bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left"
            >
              <div className="relative w-28 h-28 shrink-0 bg-muted flex items-center justify-center">
                {recipe.image_url ? (
                  <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                ) : (
                  <ChefHat className="h-8 w-8 text-muted-foreground opacity-50" />
                )}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {recipe.tags[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 py-3 pr-3 min-w-0 flex flex-col relative">
                <div className="pr-8">
                  <p className="font-bold text-foreground text-[16px] mb-1 leading-tight truncate">{recipe.title}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-2 truncate">
                    {recipe.created_by === user?.id ? "Von dir" : `Von ${recipe.profiles?.name || "Freund"}`}
                  </p>
                </div>
                
                <div 
                  className="absolute top-2 right-2 p-1.5 -m-1.5"
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
                >
                  <Heart className={`h-5 w-5 transition-colors ${recipe.is_favorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                </div>

                <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {(recipe.prep_time || 0) + (recipe.cook_time || 0)} Min
                  </span>
                  <span className="flex items-center gap-1">
                    <ChefHat className="h-3.5 w-3.5" />
                    {recipe.difficulty === 'easy' ? 'Leicht' : recipe.difficulty === 'medium' ? 'Mittel' : 'Schwer'}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
