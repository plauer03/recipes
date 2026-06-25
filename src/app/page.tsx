"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, BookOpen, ArrowRight, ChefHat, Loader2, Heart } from "lucide-react";
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

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [feed, setFeed] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-full pb-10" style={{ fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Sticky Top Header with SafeArea */}
      <header 
        className="sticky top-0 z-20 flex items-end justify-between px-5 pb-3 bg-background/90 backdrop-blur-xl border-b border-border w-full"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
      >
        <span
          className="text-xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display, system-ui)' }}
        >
          RecipeHub
        </span>
      </header>

      {/* Greeting */}
      <div className="px-5 pt-6 pb-6">
        <p className="text-sm font-semibold text-muted-foreground mb-1">Guten Appetit 👋</p>
        <h2
          className="text-3xl font-extrabold text-foreground leading-tight mb-4"
          style={{ fontFamily: 'var(--font-display, system-ui)' }}
        >
          Was kochst du<br />heute?
        </h2>
        <button
          onClick={() => router.push('/add-recipe')}
          className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold active:scale-95 transition-all shadow-md"
        >
          Neues Rezept
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Own Recipes Square Cards Slider */}
      {recipes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between px-5 mb-4">
            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
              Deine Rezepte
            </h3>
            <button onClick={() => router.push('/recipes')} className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Alle
            </button>
          </div>
          <div className="flex overflow-x-auto px-5 pb-4 gap-4 snap-x snap-mandatory no-scrollbar">
            {recipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => router.push(`/recipes/${recipe.id}`)}
                className="snap-start shrink-0 w-44 flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-sm active:scale-95 transition-all text-left"
              >
                <div className="w-full h-36 bg-muted relative">
                  {recipe.image_url ? (
                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="h-10 w-10 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  {recipe.is_favorite && (
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-full">
                      <Heart className="h-4 w-4 fill-destructive text-destructive" />
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <p className="font-bold text-foreground text-[15px] mb-1 line-clamp-2 leading-tight">{recipe.title}</p>
                  <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-2">
                    <Clock className="h-3.5 w-3.5" />
                    {(recipe.prep_time || 0) + (recipe.cook_time || 0)} Min
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-5 mb-8">
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

      {/* Feed (Small Horizontal Cards) */}
      <div className="mb-7">
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
