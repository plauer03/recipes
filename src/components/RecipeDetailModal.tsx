"use client";

import { useState, useEffect } from "react";
import { 
  X, Check, ShoppingBag, 
  Trash2, ChefHat, Scale,
  Edit3, Flame, Heart, Play
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RecipeDetailModalProps {
  recipe: any;
  onClose: () => void;
  onEdit?: (recipe: any) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (recipe: any) => void;
}

export default function RecipeDetailModal({ 
  recipe, 
  onClose, 
  onEdit, 
  onDelete,
  onToggleFavorite 
}: RecipeDetailModalProps) {
  const [portions, setPortions] = useState(recipe.base_portions || 1);
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
  const [isCooking, setIsCooking] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchIngredients();
  }, [recipe.id]);

  async function fetchIngredients() {
    const { data: ings } = await supabase
      .from('recipe_ingredients')
      .select('*, ingredients(name, unit_type, calories_per_100g)')
      .eq('recipe_id', recipe.id);
    
    if (ings) setRecipeIngredients(ings);
  }

  const getCaloriesPerPortion = () => {
    if (!recipeIngredients || recipeIngredients.length === 0) return 0;
    
    let totalCals = 0;
    for (const ing of recipeIngredients) {
      let amountInGrams = ing.amount;
      if (ing.unit === 'EL') amountInGrams *= 15;
      if (ing.unit === 'TL') amountInGrams *= 5;
      if (ing.unit === 'Stk') amountInGrams *= 100;
      
      const calsPer100 = ing.ingredients?.calories_per_100g || 0;
      totalCals += (amountInGrams / 100) * calsPer100;
    }
    
    return Math.round(totalCals / (recipe.base_portions || 1));
  };

  async function addToShoppingList() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (recipeIngredients.length > 0) {
      const scale = portions / (recipe.base_portions || 1);
      const items = recipeIngredients.map(link => {
        let finalAmount = link.amount * scale;
        if (link.unit === 'EL') finalAmount *= 15;
        if (link.unit === 'TL') finalAmount *= 5;

        return {
          user_id: user.id,
          ingredient_id: link.ingredient_id,
          amount_in_grams: Math.round(finalAmount)
        };
      });
      
      const { error } = await supabase.from('shopping_list').insert(items);
      if (!error) alert("Einkaufsliste aktualisiert!");
      else alert("Fehler beim Hinzufügen.");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[88vh] flex flex-col gap-6 fade-in shadow-2xl overflow-hidden">
        <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
        
        <div className="flex justify-between items-start shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-2xl font-bold truncate pr-2">{recipe.title}</h2>
            {recipeIngredients.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1 text-[var(--primary)] font-bold text-sm bg-[var(--primary)]/10 w-fit px-2.5 py-0.5 rounded-full">
                <Flame size={14} /> {getCaloriesPerPortion()} kcal / Port.
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {onToggleFavorite && (
              <button 
                onClick={() => onToggleFavorite(recipe)} 
                className={`w-10 h-10 rounded-full flex items-center justify-center ios-active-scale transition-colors ${recipe.is_favorite ? 'bg-pink-100/50 text-pink-500' : 'bg-[var(--muted)]/50 text-[var(--muted-foreground)]'}`}
              >
                <Heart size={18} className={recipe.is_favorite ? 'fill-pink-500' : ''} />
              </button>
            )}
            {onEdit && (
              <button onClick={() => onEdit(recipe)} className="w-10 h-10 rounded-full bg-[var(--muted)]/50 flex items-center justify-center text-[var(--muted-foreground)] ios-active-scale">
                <Edit3 size={18} />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(recipe.id)} className="w-10 h-10 rounded-full bg-red-100/50 flex items-center justify-center text-red-500 ios-active-scale">
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-[var(--muted)]/50 flex items-center justify-center text-[var(--muted-foreground)] ios-active-scale">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-24 px-1">
          <div className="bg-[var(--card)] p-4 rounded-2xl flex justify-between items-center border border-[var(--border)]/5 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-sm tracking-tight"><Scale size={18} className="text-[var(--primary)]" /> Portionen anpassen</div>
            <div className="flex items-center gap-4">
              <button onClick={() => setPortions(Math.max(1, portions - 1))} className="w-9 h-9 rounded-full bg-[var(--muted)]/50 flex items-center justify-center font-bold text-xl active:bg-[var(--muted)] transition-colors">-</button>
              <span className="font-bold text-xl w-4 text-center">{portions}</span>
              <button onClick={() => setPortions(portions + 1)} className="w-9 h-9 rounded-full bg-[var(--muted)]/50 flex items-center justify-center font-bold text-xl active:bg-[var(--muted)] transition-colors">+</button>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={addToShoppingList} className="flex-1 bg-[var(--foreground)] text-[var(--background)] py-4 rounded-[24px] font-bold flex items-center justify-center gap-3 shadow-lg ios-active-scale">
              <ShoppingBag size={20} /> Einkauf
            </button>
            <button onClick={() => setIsCooking(true)} className="flex-1 bg-[var(--primary)] text-white py-4 rounded-[24px] font-bold flex items-center justify-center gap-3 shadow-lg ios-active-scale">
              <Play size={20} fill="white" /> Kochen
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Zutaten</h3>
            <div className="bg-[var(--card)] rounded-[24px] border border-[var(--border)]/5 shadow-sm overflow-hidden divide-y divide-[var(--border)]/5">
              {recipeIngredients.map((ing, i) => {
                const scale = portions / (recipe.base_portions || 1);
                const calcAmount = Math.round(ing.amount * scale * 10) / 10;
                return (
                  <div key={i} className="p-4 flex justify-between items-center text-sm">
                    <span className="font-bold">{ing.ingredients?.name || "Unbekannt"}</span>
                    <span className="font-bold text-[var(--muted-foreground)] uppercase tracking-tighter text-xs">{calcAmount} {ing.unit}</span>
                  </div>
                );
              })}
              {recipeIngredients.length === 0 && <p className="p-8 text-center text-xs font-bold text-[var(--muted-foreground)]">Keine Zutaten hinterlegt.</p>}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Zubereitung</h3>
            <div className="p-5 bg-[var(--card)] rounded-[24px] text-[16px] font-medium leading-relaxed shadow-sm border border-[var(--border)]/5 whitespace-pre-wrap">{recipe.instructions || "Keine Anleitung hinterlegt."}</div>
          </div>
        </div>

        {/* Cooking Mode Modal */}
        {isCooking && (
          <div className="fixed inset-0 z-[200] bg-[var(--background)] flex flex-col fade-in overflow-hidden">
            <header className="p-6 pb-2 border-b border-[var(--border)]/10 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold truncate pr-4">{recipe.title}</h2>
              <button onClick={() => setIsCooking(false)} className="w-10 h-10 rounded-full bg-[var(--muted)]/50 flex items-center justify-center text-[var(--muted-foreground)]"><X size={20} /></button>
            </header>
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-20 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Zutaten für {portions} Port.</h3>
                  <div className="flex items-center gap-1.5 text-[var(--primary)] font-bold text-sm bg-[var(--primary)]/10 px-3 py-1 rounded-full"><Flame size={14} /> {getCaloriesPerPortion()} kcal</div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {recipeIngredients.map((ing, i) => {
                    const scale = portions / (recipe.base_portions || 1);
                    const calcAmount = Math.round(ing.amount * scale * 10) / 10;
                    return (
                      <div key={i} className="flex items-center gap-4 bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/5 shadow-sm">
                        <div className="w-6 h-6 rounded-full border-2 border-[var(--primary)] flex items-center justify-center shrink-0"><Check size={14} className="text-white" /></div>
                        <span className="font-bold flex-1">{ing.ingredients?.name}</span>
                        <span className="font-bold text-[var(--primary)]">{calcAmount} {ing.unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Zubereitung</h3>
                <div className="p-6 bg-[var(--card)] rounded-[32px] text-[18px] font-medium leading-relaxed shadow-sm border border-[var(--border)]/5 whitespace-pre-wrap">{recipe.instructions || "Keine Anleitung hinterlegt."}</div>
              </div>
              <button onClick={() => setIsCooking(false)} className="w-full bg-[var(--primary)] text-white py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-[var(--primary)]/20">Kochen beendet</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
