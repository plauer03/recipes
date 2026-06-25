"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Users, ChefHat, Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  async function fetchRecipe() {
    setLoading(true);
    const { data: rec } = await supabase
      .from('recipes')
      .select('*, profiles:created_by(name, avatar_url)')
      .eq('id', id)
      .single();
    
    if (rec) {
      setRecipe({
        ...rec,
        image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800",
        prepTime: rec.base_portions || 15,
        cookTime: 20,
        difficulty: "easy",
        author: rec.profiles?.name || 'Unbekannt',
        authorAvatar: rec.profiles?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        ingredients: rec.ingredients_data || [],
        instructions: rec.instructions ? rec.instructions.split('\n').filter((l: string) => l.trim().length > 0) : ['Keine Zubereitungsschritte angegeben.'],
      });
    }
    setLoading(false);
  }

  async function toggleLike() {
    if (!recipe) return;
    const newStatus = !recipe.is_favorite;
    setRecipe({ ...recipe, is_favorite: newStatus, likes: (recipe.likes || 0) + (newStatus ? 1 : -1) });
    await supabase.from('recipes').update({ is_favorite: newStatus }).eq('id', id);
  }

  const handleAddToShoppingList = () => {
    // Implement shopping list adding here (needs Supabase logic)
    alert("In Bearbeitung! Wird in den Warenkorb gelegt.");
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <p className="text-muted-foreground mb-4 font-medium">Rezept nicht gefunden</p>
        <Button onClick={() => router.push('/recipes')}>Zurück zu Rezepten</Button>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header Image */}
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-64 object-cover"
        />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/90 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <button
          onClick={toggleLike}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/90 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          <Heart
            className={`h-5 w-5 ${
              recipe.is_favorite
                ? 'fill-destructive text-destructive'
                : 'text-foreground'
            }`}
          />
        </button>
      </div>

      {/* Recipe Info */}
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold mb-2 text-foreground">{recipe.title}</h1>
        <p className="text-muted-foreground mb-4">{recipe.description || 'Ein leckeres Rezept für jeden Tag.'}</p>

        {/* Author */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src={recipe.authorAvatar}
            alt={recipe.author}
            className="w-10 h-10 rounded-full object-cover bg-secondary"
          />
          <div>
            <p className="font-medium text-foreground">{recipe.author}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(recipe.created_at).toLocaleDateString('de-DE')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card className="border-border shadow-sm">
            <CardContent className="p-3 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs font-medium text-foreground">{recipe.prepTime}m</div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Vorb.</div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="p-3 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs font-medium text-foreground">{recipe.cookTime}m</div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Koch.</div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="p-3 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs font-medium text-foreground">{recipe.base_portions || 1}</div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Port.</div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="p-3 text-center">
              <ChefHat className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs font-medium text-foreground">
                {recipe.difficulty === 'easy' ? 'Leicht' : recipe.difficulty === 'medium' ? 'Mittel' : 'Schwer'}
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Level</div>
            </CardContent>
          </Card>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Zutaten</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToShoppingList}
              className="gap-2 rounded-full font-semibold"
            >
              <ShoppingCart className="h-4 w-4" />
              Zur Liste
            </Button>
          </div>
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <ul className="space-y-3">
                {recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ingredient: any, index: number) => (
                    <li key={index} className="flex items-center justify-between text-foreground">
                      <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="font-medium">{ingredient.name}</span>
                      </div>
                      <div className="text-muted-foreground text-sm font-medium">
                        {ingredient.amount} {ingredient.unit}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground text-sm">Keine Zutaten angegeben</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Zubereitung</h2>
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <ol className="space-y-5">
                {recipe.instructions.map((instruction: string, index: number) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
                      {index + 1}
                    </span>
                    <span className="text-foreground pt-0.5 leading-relaxed font-medium text-sm">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
