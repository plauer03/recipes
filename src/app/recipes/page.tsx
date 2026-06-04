"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, X, Check, ShoppingBag, 
  Trash2, ChefHat, ChevronRight, Scale,
  Loader2, AlertCircle, Apple
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories_per_100g: number;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [portions, setPortions] = useState(2);
  const supabase = createClient();

  // New Recipe Form
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredientsList, setIngredientsList] = useState<RecipeIngredient[]>([]);
  
  // Ingredient Input
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  const [isSelectingIngredient, setIsSelectingIngredient] = useState(false);
  const [ingAmount, setIngAmount] = useState("");
  const [ingUnit, setIngUnit] = useState("g");

  const units = ["g", "ml", "Stk", "EL", "TL"];

  useEffect(() => {
    fetchRecipes();
    fetchAvailableIngredients();
  }, []);

  async function fetchRecipes() {
    setLoading(true);
    const { data } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
    if (data) setRecipes(data);
    setLoading(false);
  }

  async function fetchAvailableIngredients() {
    const { data } = await supabase.from('ingredients').select('*').order('name');
    if (data) setAvailableIngredients(data);
  }

  const selectIngredient = (ing: any) => {
    setIngredientsList([...ingredientsList, { 
      id: ing.id,
      name: ing.name, 
      amount: Number(ingAmount) || 0, 
      unit: ingUnit, 
      calories_per_100g: ing.calories_per_100g 
    }]);
    setIsSelectingIngredient(false);
    setIngAmount("");
  };

  async function handleSave() {
    if (!title) return;
    setSaving(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht eingeloggt");

      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert([{
          title,
          instructions,
          created_by: user.id,
        }])
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Link ingredients (recipe_ingredients table)
      if (ingredientsList.length > 0) {
        const links = ingredientsList.map(ing => ({
          recipe_id: recipeData.id,
          ingredient_id: ing.id,
          amount_in_grams: ing.amount // Simplified: mapping amount to amount_in_grams
        }));
        await supabase.from('recipe_ingredients').insert(links);
      }

      setIsAdding(false);
      resetForm();
      fetchRecipes();
    } catch (err: any) {
      setError(err.message || "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  const resetForm = () => {
    setTitle("");
    setInstructions("");
    setIngredientsList([]);
    setError(null);
  };

  return (
    <div className="space-y-6 fade-in h-full flex flex-col">
      <header className="pt-2 flex justify-between items-center shrink-0">
        <h1 className="text-3xl font-bold tracking-tight px-1">Rezepte</h1>
        <button onClick={() => setIsAdding(true)} className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-lg ios-active-scale">
          <Plus size={24} />
        </button>
      </header>

      <div className="relative shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
        <input type="text" placeholder="Rezepte suchen..." className="w-full bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-3.5 pl-11 pr-4 font-medium outline-none shadow-sm" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 space-y-3">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[var(--primary)]" /></div>
        ) : recipes.length > 0 ? (
          recipes.map(r => (
            <div key={r.id} onClick={() => setSelectedRecipe(r)} className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/5 shadow-sm flex items-center gap-4 ios-active-scale cursor-pointer">
              <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center text-[var(--primary)]"><ChefHat size={24} /></div>
              <div className="flex-1 truncate">
                <h3 className="font-bold text-[17px]">{r.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)] truncate">{r.instructions || "Keine Anleitung"}</p>
              </div>
              <ChevronRight size={18} className="text-[var(--muted-foreground)] opacity-20" />
            </div>
          ))
        ) : (
          <div className="py-20 text-center opacity-30">
            <ChefHat size={48} className="mx-auto mb-4" />
            <p className="font-bold text-sm uppercase tracking-widest">Keine Rezepte gefunden</p>
          </div>
        )}
      </div>

      {/* Add Recipe Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setIsAdding(false)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[92dvh] flex flex-col gap-6 fade-in overflow-hidden shadow-2xl">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold">Neues Rezept</h2>
              <button onClick={() => setIsAdding(false)} disabled={saving} className="text-[var(--primary)] font-bold active:opacity-50">Abbrechen</button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 text-sm font-bold shrink-0">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-32">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Titel</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Name des Gerichts" className="w-full bg-[var(--card)] p-4 rounded-2xl outline-none font-bold text-lg shadow-sm" />
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Zutaten</h3>
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)]/10 overflow-hidden shadow-sm">
                  {ingredientsList.map((ing, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border-b border-[var(--border)]/5 text-sm animate-in fade-in">
                      <span className="font-bold flex-1">{ing.name}</span>
                      <span className="text-[var(--muted-foreground)] font-medium">{ing.amount}{ing.unit}</span>
                      <button onClick={() => setIngredientsList(ingredientsList.filter((_, idx) => idx !== i))} className="text-red-500 p-1"><X size={16} /></button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setIsSelectingIngredient(true)}
                    className="w-full p-4 flex items-center justify-center gap-2 text-[var(--primary)] font-bold text-sm bg-[var(--muted)]/20 active:opacity-50"
                  >
                    <Plus size={18} /> Zutat hinzufügen
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Anleitung</h3>
                <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Zubereitungsschritte..." rows={5} className="w-full bg-[var(--card)] p-4 rounded-2xl border-none outline-none font-medium shadow-sm resize-none leading-relaxed" />
              </div>

              <button 
                onClick={handleSave} 
                disabled={!title || saving}
                className="w-full bg-[var(--primary)] text-white py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-[var(--primary)]/20 ios-active-scale disabled:opacity-50 flex items-center justify-center"
              >
                {saving ? <Loader2 className="animate-spin" /> : "Rezept speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select Ingredient Modal */}
      {isSelectingIngredient && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSelectingIngredient(false)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[80dvh] flex flex-col gap-6 fade-in overflow-hidden shadow-2xl">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            <h2 className="text-xl font-bold">Zutat auswählen</h2>
            
            <div className="flex gap-2 shrink-0">
              <input type="number" value={ingAmount} onChange={e => setIngAmount(e.target.value)} placeholder="Menge" className="flex-1 bg-[var(--card)] p-4 rounded-2xl outline-none font-bold" />
              <select value={ingUnit} onChange={e => setIngUnit(e.target.value)} className="w-24 bg-[var(--card)] p-4 rounded-2xl outline-none font-bold appearance-none text-center">
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-10">
              {availableIngredients.length > 0 ? availableIngredients.map(ing => (
                <button 
                  key={ing.id} 
                  onClick={() => selectIngredient(ing)}
                  className="w-full bg-[var(--card)] p-4 rounded-2xl flex justify-between items-center border border-[var(--border)]/5 active:bg-[var(--muted)]/50"
                >
                  <span className="font-bold">{ing.name}</span>
                  <span className="text-xs text-[var(--muted-foreground)] font-bold">{ing.calories_per_100g} kcal/100g</span>
                </button>
              )) : (
                <div className="py-20 text-center">
                  <p className="text-[var(--muted-foreground)] font-medium">Keine Zutaten in der Datenbank.</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">Lege zuerst Zutaten in den Einstellungen an.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recipe Details */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRecipe(null)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[85dvh] flex flex-col gap-6 fade-in overflow-hidden shadow-2xl">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold truncate pr-4">{selectedRecipe.title}</h2>
              <button onClick={() => setSelectedRecipe(null)} className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-24">
              <div className="bg-[var(--card)] p-4 rounded-2xl flex justify-between items-center border border-[var(--border)]/5 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-sm"><Scale size={18} className="text-[var(--primary)]" /> Portionen</div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setPortions(Math.max(1, portions - 1))} className="w-9 h-9 rounded-full bg-[var(--muted)]/50 flex items-center justify-center font-bold text-xl active:bg-[var(--muted)]">-</button>
                  <span className="font-bold text-xl w-4 text-center">{portions}</span>
                  <button onClick={() => setPortions(portions + 1)} className="w-9 h-9 rounded-full bg-[var(--muted)]/50 flex items-center justify-center font-bold text-xl active:bg-[var(--muted)]">+</button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Anleitung</h3>
                <div className="p-5 bg-[var(--card)] rounded-[24px] text-[16px] font-medium leading-relaxed shadow-sm border border-[var(--border)]/5 whitespace-pre-wrap">{selectedRecipe.instructions || "Keine Anleitung hinterlegt."}</div>
              </div>

              <button className="w-full bg-[var(--foreground)] text-[var(--background)] py-5 rounded-[24px] font-bold flex items-center justify-center gap-3 shadow-lg ios-active-scale mt-4"><ShoppingBag size={22} /> Auf Einkaufsliste setzen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
