"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Heart, BookOpen, TrendingUp, ArrowRight, ChefHat, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  is_favorite?: boolean;
  likes?: number;
  created_by: string;
  created_at?: string;
  ingredients_data?: any;
  profiles?: {
    name?: string;
    avatar_url?: string;
  };
  [key: string]: any;
}

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Fetch user's recipes
      const { data: recs } = await supabase
        .from('recipes')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (recs) {
        // Map data to match UI expectations
        const mappedRecs = recs.map(r => ({
          ...r,
          image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800", // Placeholder until we have real images
          prepTime: r.base_portions || 15,
          cookTime: 20,
          difficulty: "easy",
          likes: r.is_favorite ? 10 : 2,
          description: r.instructions?.substring(0, 50) + "..." || "Leckeres Rezept"
        }));
        setRecipes(mappedRecs);
      }
    }
    setLoading(false);
  }

  const featuredRecipes = recipes.slice(0, 3);
  const popularRecipes = [...recipes].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 4);
  const totalLikes = recipes.reduce((sum, r) => sum + (r.likes || 0), 0);
  const favCount = recipes.filter(r => r.is_favorite).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-full pb-10" style={{ fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Greeting */}
      <div className="px-5 pt-4 pb-6">
        <p className="text-sm font-semibold text-primary mb-1">Guten Appetit 👋</p>
        <h2
          className="text-3xl font-extrabold text-foreground leading-tight mb-4"
          style={{ fontFamily: 'var(--font-display, system-ui)' }}
        >
          Was kochst du<br />heute?
        </h2>
        <button
          onClick={() => router.push('/add-recipe')}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold active:scale-95 transition-all"
          style={{ boxShadow: '0 4px 16px rgba(0, 208, 132, 0.30)' }}
        >
          Neues Rezept
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="px-5 mb-7">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: BookOpen, value: recipes.length, label: 'Rezepte', iconClass: 'text-primary', bgClass: 'bg-accent' },
            { icon: Heart, value: favCount, label: 'Favoriten', iconClass: 'text-rose-500', bgClass: 'bg-rose-50 dark:bg-rose-950/30' },
            { icon: TrendingUp, value: totalLikes, label: 'Likes', iconClass: 'text-violet-500', bgClass: 'bg-violet-50 dark:bg-violet-950/30' },
          ].map(({ icon: Icon, value, label, iconClass, bgClass }) => (
            <div key={label} className="bg-card rounded-2xl p-4 border border-border shadow-sm shadow-black/5">
              <div className={`w-8 h-8 rounded-xl ${bgClass} ${iconClass} flex items-center justify-center mb-2`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-foreground leading-none mb-0.5">{value}</div>
              <div className="text-xs text-muted-foreground font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured */}
      {featuredRecipes.length > 0 && (
        <div className="mb-7">
          <div className="flex items-center justify-between px-5 mb-3">
            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
              Zuletzt hinzugefügt
            </h3>
            <button
              onClick={() => router.push('/recipes')}
              className="text-sm font-semibold text-primary flex items-center gap-1"
            >
              Alle <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-3 px-5">
            {featuredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => router.push(`/recipes/${recipe.id}`)}
                className="w-full flex gap-3 bg-card rounded-2xl overflow-hidden border border-border shadow-sm shadow-black/5 hover:shadow-md active:scale-[0.98] transition-all text-left"
              >
                <div className="w-24 h-24 shrink-0 bg-muted">
                  <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 py-3 pr-3 min-w-0">
                  <p className="font-semibold text-foreground text-sm mb-1 truncate">{recipe.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{recipe.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {(recipe.prepTime || 0) + (recipe.cookTime || 0)} Min
                    </span>
                    <span className="flex items-center gap-1">
                      <ChefHat className="h-3 w-3" />
                      {recipe.difficulty === 'easy' ? 'Einfach' : recipe.difficulty === 'medium' ? 'Mittel' : 'Schwer'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Grid */}
      {popularRecipes.length > 0 && (
        <div className="px-5">
          <h3 className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
            Beliebt
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {popularRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => router.push(`/recipes/${recipe.id}`)}
                className="w-full bg-card rounded-2xl overflow-hidden border border-border shadow-sm shadow-black/5 hover:shadow-md active:scale-[0.98] transition-all text-left"
              >
                <div className="relative w-full h-32 bg-muted">
                  <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                    <Heart className="h-2.5 w-2.5 fill-current" />
                    {recipe.likes}
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-foreground text-sm leading-snug line-clamp-1 mb-1">{recipe.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {(recipe.prepTime || 0) + (recipe.cookTime || 0)} Min
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
