"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, BookOpen, ChefHat, Loader2, Heart, Sparkles, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  created_at?: string;
  tags?: string[];
  profiles?: {
    name?: string;
    avatar_url?: string;
  };
  [key: string]: any;
}

const INSPO_TAGS = ["Abendessen", "High Protein", "Frühstück", "Schnell", "Vegan", "Snack"];

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [feed, setFeed] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Inspo State
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [inspoLoading, setInspoLoading] = useState(false);
  const [inspoRecipe, setInspoRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser);
    
    if (authUser) {
      // 1. Fetch own recipes
      const { data: recs } = await supabase
        .from('recipes')
        .select('*')
        .eq('created_by', authUser.id)
        .order('created_at', { ascending: false });
      
      if (recs) {
        setRecipes(recs);
        setFavorites(recs.filter(r => r.is_favorite));
      }

      // 2. Fetch following list
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', authUser.id);
      
      const idsToShow = [authUser.id];
      if (following && following.length > 0) {
        idsToShow.push(...following.map(f => f.following_id));
      }

      // 3. Fetch Feed with Profile Join
      const { data: feedRecs } = await supabase
        .from('recipes')
        .select('*, profiles:created_by(name, avatar_url)')
        .in('created_by', idsToShow)
        .order('created_at', { ascending: false })
        .limit(15);
      
      if (feedRecs) {
        setFeed(feedRecs);
      }
    }
    setLoading(false);
  }

  const handleInspo = async (tag: string) => {
    const newTags = activeTags.includes(tag) 
      ? activeTags.filter(t => t !== tag) 
      : [...activeTags, tag];
      
    setActiveTags(newTags);
    
    if (newTags.length === 0) {
      setInspoRecipe(null);
      return;
    }
    
    setInspoLoading(true);
    // Fetch all recipes containing ALL selected tags
    const { data } = await supabase.from('recipes')
      .select('*, profiles:created_by(name)')
      .contains('tags', newTags);
      
    if (data && data.length > 0) {
      const random = data[Math.floor(Math.random() * data.length)];
      setInspoRecipe(random);
    } else {
      setInspoRecipe(null);
    }
    setInspoLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-full pb-10" style={{ fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Greeting */}
      <div className="px-5 pt-6">
        <p className="text-sm font-semibold text-muted-foreground">Willkommen zurück 👋</p>
      </div>

      {/* Stats */}
      <div className="px-5 pt-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none mb-1">{recipes.length}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Erstellt</div>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary text-foreground flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none mb-1">{favorites.length}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Favoriten</div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspo Widget */}
      <div className="mb-8">
        <div className="px-5 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-foreground" />
          <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
            Inspiration finden
          </h3>
        </div>
        <div className="flex overflow-x-auto pb-4 gap-2 snap-x snap-mandatory no-scrollbar">
          <div className="w-3 shrink-0" />
          {INSPO_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleInspo(tag)}
              className={`snap-start shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                activeTags.includes(tag) 
                  ? 'bg-foreground text-background scale-105' 
                  : 'bg-card text-foreground border border-border hover:bg-secondary'
              }`}
            >
              {tag}
            </button>
          ))}
          <div className="w-3 shrink-0" />
        </div>

        {/* Inspo Result */}
        {activeTags.length > 0 && (
          <div className="px-5 mb-4 animate-in fade-in slide-in-from-top-2">
            {inspoLoading ? (
              <div className="w-full h-32 bg-secondary rounded-2xl flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : inspoRecipe ? (
              <button
                onClick={() => router.push(`/recipes/${inspoRecipe.id}`)}
                className="w-full bg-card rounded-2xl overflow-hidden border border-border shadow-md active:scale-[0.98] transition-all text-left relative"
              >
                <div className="absolute top-3 left-3 bg-foreground text-background text-[10px] font-bold uppercase px-2 py-1 rounded-full z-10 flex gap-1">
                  {activeTags.map(t => <span key={t}>{t}</span>)}
                </div>
                <div className="w-full h-40 bg-muted relative">
                  {inspoRecipe.image_url ? (
                    <img src={inspoRecipe.image_url} alt={inspoRecipe.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="h-10 w-10 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h4 className="font-bold text-white text-lg leading-tight mb-1">{inspoRecipe.title}</h4>
                      <p className="text-white/80 text-xs font-medium">Von {inspoRecipe.profiles?.name || "Freund"}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <div className="w-full py-8 px-4 bg-secondary rounded-2xl text-center border border-border border-dashed">
                <p className="text-sm font-medium text-muted-foreground">Leider kein Rezept für "{activeTags.join(', ')}" gefunden.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feed (Small Horizontal Cards) */}
      <div className="mb-7 mt-4 border-t border-border/50 pt-6">
        <div className="flex items-center justify-between px-5 mb-4">
          <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
            Aktivität (Dein Feed)
          </h3>
        </div>
        <div className="flex flex-col gap-3 px-5">
          {feed.length > 0 ? feed.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => router.push(`/recipes/${recipe.id}`)}
              className="w-full flex gap-3 bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left"
            >
              <div className="w-24 h-24 shrink-0 bg-muted flex items-center justify-center relative">
                {recipe.image_url ? (
                  <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                ) : (
                  <ChefHat className="h-8 w-8 text-muted-foreground opacity-50" />
                )}
                {recipe.is_favorite && (
                  <div className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm p-1 rounded-full">
                    <Heart className="h-3 w-3 fill-destructive text-destructive" />
                  </div>
                )}
              </div>
              <div className="flex-1 py-3 pr-3 min-w-0 flex flex-col justify-center">
                <p className="font-bold text-foreground text-[15px] mb-1 truncate">{recipe.title}</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-2 truncate">
                  {recipe.created_by === user?.id ? "Von dir" : `Von ${recipe.profiles?.name || "Freund"}`}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
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
          )) : (
            <div className="text-center py-10 bg-card rounded-2xl border border-border border-dashed">
              <ChefHat className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Keine Rezepte im Feed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
