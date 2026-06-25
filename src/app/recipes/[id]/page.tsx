"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, ChefHat, Heart, Edit, Loader2, ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function RecipeDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const resolvedParams = use(params);
  const recipeId = resolvedParams.id;

  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [addingToList, setAddingToList] = useState(false);
  const [successAdded, setSuccessAdded] = useState(false);
  const [servings, setServings] = useState(1);

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  async function addToShoppingList() {
    if (!recipe || !user || !recipe.ingredients_data) return;
    setAddingToList(true);
    
    const scale = servings / (recipe.default_servings || 1);
    const items = recipe.ingredients_data.map((ing: any) => ({
      user_id: user.id,
      ingredient_name: ing.name,
      original_amount: (Number(ing.amount) || 0) * scale,
      unit: ing.unit || 'g',
      is_checked: false
    }));

    const { error } = await supabase.from('shopping_list').insert(items);
    
    setAddingToList(false);
    if (error) {
      toast.error('Fehler beim Hinzufügen zur Einkaufsliste.');
    } else {
      setSuccessAdded(true);
      setTimeout(() => setSuccessAdded(false), 2000);
    }
  }

  async function fetchRecipe() {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser);

    const { data, error } = await supabase
      .from('recipes')
      .select('*, profiles:created_by(name, avatar_url)')
      .eq('id', recipeId)
      .single();

    if (data && !error) {
      setRecipe(data);
      setServings(data.default_servings || 1);
    }
    setLoading(false);
  }

  async function toggleFavorite() {
    if (!recipe) return;
    const newStatus = !recipe.is_favorite;
    setRecipe({ ...recipe, is_favorite: newStatus });
    await supabase.from('recipes').update({ is_favorite: newStatus }).eq('id', recipeId);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-foreground" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-5 text-center">
        <p className="text-muted-foreground mb-4">Rezept nicht gefunden.</p>
        <button onClick={() => router.back()} className="text-foreground underline">Zurück</button>
      </div>
    );
  }

  const isOwner = user?.id === recipe.created_by;

  return (
    <div className="pb-28 min-h-full bg-background" style={{ fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Hero Image */}
      <div className="relative h-[45dvh] w-full bg-muted">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="h-16 w-16 text-muted-foreground opacity-50" />
          </div>
        )}
        
        {/* Top actions overlay */}
        <div className="absolute top-0 w-full p-5 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex gap-2">
            {isOwner && (
              <button 
                onClick={() => router.push(`/edit-recipe/${recipeId}`)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            <button 
              onClick={toggleFavorite}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <Heart className={`h-5 w-5 transition-colors ${recipe.is_favorite ? 'fill-destructive text-destructive' : ''}`} />
            </button>
          </div>
        </div>

        {/* Floating recipe info box over the image */}
        <div className="absolute bottom-0 w-full translate-y-6 px-5">
          <div className="bg-card border border-border shadow-lg rounded-3xl p-5 backdrop-blur-xl">
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {recipe.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="inline-block bg-foreground text-background text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-2xl font-bold text-foreground leading-tight mb-1" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
              {recipe.title}
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              {isOwner ? "Erstellt von dir" : `Erstellt von ${recipe.profiles?.name || "Freund"}`}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-12 space-y-6">
        {/* Info badges */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-secondary rounded-2xl p-3 flex flex-col items-center justify-center gap-1 border border-border/50">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">{(recipe.prep_time || 0) + (recipe.cook_time || 0)} Min</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Gesamt</span>
          </div>
          <div className="flex-1 bg-secondary rounded-2xl p-3 flex flex-col items-center justify-center gap-1 border border-border/50">
            <ChefHat className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">
              {recipe.difficulty === 'easy' ? 'Leicht' : recipe.difficulty === 'medium' ? 'Mittel' : 'Schwer'}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Level</span>
          </div>
        </div>

        {recipe.description && (
          <p className="text-[15px] text-muted-foreground leading-relaxed font-medium">
            {recipe.description}
          </p>
        )}

        {/* Nutrition overview from AI */}
        {recipe.ingredients_data && recipe.ingredients_data.length > 0 && (
          <div className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-md">
            <h3 className="font-bold mb-3 flex items-center justify-between">
              Makros
              <span className="text-xs bg-primary-foreground/20 px-2 py-1 rounded text-primary-foreground">Gesamt</span>
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center divide-x divide-primary-foreground/20">
              {(() => {
                const scale = servings / (recipe.default_servings || 1);
                const formatMacro = (val: number, isKcal: boolean = false) => {
                  if (isKcal) return Math.round(val);
                  if (val < 10) return Number(val.toFixed(1));
                  return Math.round(val);
                };
                return (
                  <>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold mb-1">Kcal</div>
                      <div className="font-bold text-lg">
                        {formatMacro(recipe.ingredients_data.reduce((acc: number, cur: any) => acc + (cur.calories || 0), 0) * scale, true)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold mb-1">Protein</div>
                      <div className="font-bold text-lg">
                        {formatMacro(recipe.ingredients_data.reduce((acc: number, cur: any) => acc + (cur.protein || 0), 0) * scale)}g
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold mb-1">Carbs</div>
                      <div className="font-bold text-lg">
                        {formatMacro(recipe.ingredients_data.reduce((acc: number, cur: any) => acc + (cur.carbs || 0), 0) * scale)}g
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider opacity-80 font-bold mb-1">Fett</div>
                      <div className="font-bold text-lg">
                        {formatMacro(recipe.ingredients_data.reduce((acc: number, cur: any) => acc + (cur.fat || 0), 0) * scale)}g
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-display, system-ui)' }}>Zutaten</h2>
            <div className="flex items-center gap-4 bg-secondary rounded-xl px-2 py-1 shadow-inner border border-border/50">
              <button onClick={() => setServings(s => Math.max(1, s - 1))} className="text-muted-foreground hover:text-foreground font-bold p-1 active:scale-95 transition-transform">-</button>
              <span className="font-bold w-4 text-center text-sm">{servings}</span>
              <button onClick={() => setServings(s => s + 1)} className="text-muted-foreground hover:text-foreground font-bold p-1 active:scale-95 transition-transform">+</button>
            </div>
          </div>
          <div className="space-y-2">
            {recipe.ingredients_data && recipe.ingredients_data.length > 0 ? (
              recipe.ingredients_data.map((ing: any, i: number) => {
                const scale = servings / (recipe.default_servings || 1);
                return (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <span className="text-[15px] font-medium text-foreground">{ing.name}</span>
                    <span className="text-[15px] font-bold text-muted-foreground">
                      {ing.amount ? Number((ing.amount * scale).toFixed(1)) : ''} {ing.unit}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-sm">Keine Zutaten hinterlegt.</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-display, system-ui)' }}>Zubereitung</h2>
          <div className="prose prose-sm dark:prose-invert">
            <p className="text-[15px] leading-relaxed text-muted-foreground whitespace-pre-line">
              {recipe.instructions || "Keine Anleitung hinterlegt."}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 w-full bg-background/90 backdrop-blur-xl border-t border-border p-4 pb-8 flex gap-3 z-30">
        <button 
          onClick={addToShoppingList}
          disabled={addingToList}
          className={`flex-1 font-bold rounded-2xl py-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-all border shadow-sm disabled:opacity-50 ${
            successAdded 
              ? 'bg-green-500 text-white border-green-500' 
              : 'bg-secondary text-foreground border-border hover:bg-secondary/80'
          }`}
        >
          {addingToList ? <Loader2 className="animate-spin h-5 w-5" /> : (successAdded ? <ChefHat className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />)}
          {successAdded ? 'Hinzugefügt!' : 'Einkaufsliste'}
        </button>
        <button 
          onClick={() => toast.success('Viel Spaß beim Kochen!')}
          className="flex-1 bg-foreground text-background font-bold rounded-2xl py-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md hover:bg-foreground/90"
        >
          <ChefHat className="h-5 w-5" />
          Kochen
        </button>
      </div>
    </div>
  );
}
