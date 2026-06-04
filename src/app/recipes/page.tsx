"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, X, Check, ShoppingBag, 
  Trash2, ChefHat, ChevronRight, Scale,
  Loader2, AlertCircle, Apple, Edit3
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

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredientsList, setIngredientsList] = useState<RecipeIngredient[]>([]);
  const [basePortions, setBasePortions] = useState(2);
  
  // Selection State
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  const [isSelectingIngredient, setIsSelectingIngredient] = useState(false);
  const [currentPickingIng, setCurrentPickingIng] = useState<any>(null);
  const [ingAmount, setIngAmount] = useState("");
  const [ingUnit, setIngUnit] = useState("g");

  const units = ["g", "ml", "EL", "TL"];

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

  const handlePickIngredient = (ing: any) => {
    setCurrentPickingIng(ing);
  };

  const confirmIngredient = () => {
    if (!currentPickingIng || !ingAmount) return;
    setIngredientsList([...ingredientsList, { 
      id: currentPickingIng.id,
      name: currentPickingIng.name, 
      amount: Number(ingAmount), 
      unit: ingUnit, 
      calories_per_100g: currentPickingIng.calories_per_100g 
    }]);
    setCurrentPickingIng(null);
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

      const recipeObj: any = {
        title,
        instructions,
        base_portions: basePortions,
        created_by: user.id,
      };

      let recipeId = editingId;

      if (editingId) {
        const { error: upErr } = await supabase.from('recipes').update(recipeObj).eq('id', editingId);
        if (upErr) throw upErr;
        // Clean up old ingredients
        await supabase.from('recipe_ingredients').delete().eq('recipe_id', editingId);
      } else {
        const { data, error: insErr } = await supabase.from('recipes').insert([recipeObj]).select().single();
        if (insErr) throw insErr;
        recipeId = data.id;
      }

      if (ingredientsList.length > 0 && recipeId) {
        const links = ingredientsList.map(ing => ({
          recipe_id: recipeId,
          ingredient_id: ing.id,
          amount_in_grams: ing.amount,
          unit: ing.unit
        }));
        const { error: linkErr } = await supabase.from('recipe_ingredients').insert(links);
        if (linkErr) throw linkErr;
      }

      setIsAdding(false);
      resetForm();
      fetchRecipes();
    } catch (err: any) {
      setError(err.message || "Fehler beim Speichern. Hast du das SQL-Update ausgeführt?");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecipe(id: string) {
    if (!confirm("Rezept wirklich löschen?")) return;
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (!error) {
      setRecipes(prev => prev.filter(r => r.id !== id));
      setSelectedRecipe(null);
    }
  }

  const startEdit = async (recipe: any) => {
    setEditingId(recipe.id);
    setTitle(recipe.title);
    setInstructions(recipe.instructions || "");
    setBasePortions(recipe.base_portions || 2);
    
    const { data: ings } = await supabase
      .from('recipe_ingredients')
      .select('*, ingredients(name, calories_per_100g)')
      .eq('recipe_id', recipe.id);
    
    if (ings) {
      setIngredientsList(ings.map((i: any) => ({
        id: i.ingredient_id,
        name: i.ingredients.name,
        amount: i.amount_in_grams,
        unit: i.unit || 'g',
        calories_per_100g: i.ingredients.calories_per_100g
      })));
    }
    
    setIsAdding(true);
    setSelectedRecipe(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setInstructions("");
    setIngredientsList([]);
    setBasePortions(2);
    setError(null);
  };

  async function addToShoppingList(recipe: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: ingLinks } = await supabase
      .from('recipe_ingredients')
      .select('ingredient_id, amount_in_grams, unit')
      .eq('recipe_id', recipe.id);
    
    if (ingLinks && ingLinks.length > 0) {
      const scale = portions / (recipe.base_portions || 2);
      const items = ingLinks.map(link => {
        let finalAmount = link.amount_in_grams * scale;
        if (link.unit === 'EL') finalAmount *= 15;
        if (link.unit === 'TL') finalAmount *= 5;

        return {
          user_id: user.id,
          ingredient_id: link.ingredient_id,
          amount_in_grams: Math.round(finalAmount)
        };
      });
      const { error } = await supabase.from('shopping_list').insert(items);
      if (!error) alert("Zutaten zur Einkaufsliste hinzugefügt!");
      else alert("Fehler beim Hinzufügen.");
    } else {
      alert("Keine Zutaten in diesem Rezept gefunden.");
    }
  }

  return (
    <div className="space-y-6 fade-in h-full flex flex-col overflow-hidden">
      <header className="pt-2 flex justify-between items-center shrink-0">
        <h1 className="text-3xl font-bold tracking-tight px-1">Rezepte</h1>
        <button onClick={() => { resetForm(); setIsAdding(true); }} className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-lg ios-active-scale">
          <Plus size={24} />
        </button>
      </header>

      <div className="relative shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
        <input type="text" placeholder="Rezepte suchen..." className="w-full bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-3.5 pl-11 pr-4 font-medium outline-none shadow-sm" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 space-y-3 px-1">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[var(--primary)]" /></div>
        ) : recipes.length > 0 ? (
          recipes.map(r => (
            <div key={r.id} onClick={() => {
              setSelectedRecipe(r);
              setPortions(r.base_portions || 2);
            }} className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/5 shadow-sm flex items-center gap-4 ios-active-scale cursor-pointer">
              <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center text-[var(--primary)] shrink-0"><ChefHat size={24} /></div>
              <div className="flex-1 truncate">
                <h3 className="font-bold text-[17px]">{r.title}</h3>
                <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-tight opacity-60">Basis: {r.base_portions || 2} Portionen</p>
              </div>
              <ChevronRight size={18} className="text-[var(--muted-foreground)] opacity-20" />
            </div>
          ))
        ) : (
          <div className="py-20 text-center opacity-30">
            <ChefHat size={48} className="mx-auto mb-4" />
            <p className="font-bold text-sm uppercase tracking-widest">Keine Rezepte</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setIsAdding(false)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[94vh] flex flex-col gap-6 fade-in shadow-2xl overflow-hidden">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold tracking-tight">{editingId ? "Bearbeiten" : "Neues Rezept"}</h2>
              <button onClick={() => setIsAdding(false)} disabled={saving} className="text-[var(--primary)] font-bold px-2 active:opacity-50 transition-opacity">Fertig</button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold shrink-0 shadow-sm border border-red-100">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-32">
              <div className="space-y-4">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titel" className="w-full bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/10 outline-none font-bold text-xl shadow-sm" />
                
                <div className="bg-[var(--card)] p-4 rounded-2xl flex justify-between items-center shadow-sm border border-[var(--border)]/10">
                  <span className="font-bold text-sm">Basis Portionen</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setBasePortions(Math.max(1, basePortions - 1))} className="w-9 h-9 rounded-full bg-[var(--muted)]/50 flex items-center justify-center font-bold ios-active-scale">-</button>
                    <span className="font-bold text-lg">{basePortions}</span>
                    <button onClick={() => setBasePortions(basePortions + 1)} className="w-9 h-9 rounded-full bg-[var(--muted)]/50 flex items-center justify-center font-bold ios-active-scale">+</button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Zutaten</h3>
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)]/10 overflow-hidden shadow-sm">
                  {ingredientsList.map((ing, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border-b border-[var(--border)]/5 text-sm animate-in fade-in">
                      <span className="font-bold flex-1">{ing.name}</span>
                      <span className="text-[var(--muted-foreground)] font-bold">{ing.amount}{ing.unit}</span>
                      <button onClick={() => setIngredientsList(ingredientsList.filter((_, idx) => idx !== i))} className="text-red-500/30 active:text-red-500 p-1"><X size={18} /></button>
                    </div>
                  ))}
                  <button onClick={() => setIsSelectingIngredient(true)} className="w-full p-4 flex items-center justify-center gap-2 text-[var(--primary)] font-bold text-sm bg-[var(--muted)]/20 active:opacity-50 transition-colors">
                    <Plus size={18} /> Zutat hinzufügen
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Anleitung</h3>
                <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Zubereitungsschritte..." rows={6} className="w-full bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/10 outline-none font-medium shadow-sm resize-none leading-relaxed" />
              </div>

              <button onClick={handleSave} disabled={!title || saving} className="w-full bg-[var(--primary)] text-white py-5 rounded-[24px] font-bold text-lg shadow-xl flex items-center justify-center ios-active-scale disabled:opacity-30">
                {saving ? <Loader2 className="animate-spin" /> : "Rezept speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingredient Picker Modal */}
      {isSelectingIngredient && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSelectingIngredient(false)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[85vh] flex flex-col gap-6 fade-in shadow-2xl overflow-hidden">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            
            {!currentPickingIng ? (
              <>
                <h2 className="text-xl font-bold tracking-tight">Zutat wählen</h2>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-10 px-1">
                  {availableIngredients.length > 0 ? availableIngredients.map(ing => (
                    <button key={ing.id} onClick={() => handlePickIngredient(ing)} className="w-full bg-[var(--card)] p-4 rounded-2xl flex justify-between items-center border border-[var(--border)]/5 ios-active-scale text-left">
                      <span className="font-bold">{ing.name}</span>
                      <ChevronRight size={18} className="opacity-20" />
                    </button>
                  )) : (
                    <div className="py-20 text-center opacity-30 px-6">
                      <p className="font-bold">Keine Zutaten vorhanden.</p>
                      <p className="text-sm mt-2 font-medium">Lege zuerst Zutaten in den Einstellungen an.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => setCurrentPickingIng(null)} className="p-2 -ml-2 text-[var(--primary)] font-bold">Zurück</button>
                  <h2 className="text-xl font-bold truncate">{currentPickingIng.name}</h2>
                </div>
                <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pb-10 px-1">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Menge & Einheit</label>
                    <div className="flex gap-2 h-14">
                      <input type="number" value={ingAmount} onChange={e => setIngAmount(e.target.value)} placeholder="0" className="flex-1 bg-[var(--card)] px-4 rounded-2xl outline-none font-bold text-lg shadow-sm border border-[var(--border)]/5" autoFocus />
                      <select value={ingUnit} onChange={e => setIngUnit(e.target.value)} className="w-24 bg-[var(--card)] px-2 rounded-2xl outline-none font-bold appearance-none text-center shadow-sm border border-[var(--border)]/5">
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={confirmIngredient} disabled={!ingAmount} className="w-full bg-[var(--foreground)] text-[var(--background)] py-4 rounded-2xl font-bold text-lg shadow-lg shrink-0 ios-active-scale">Übernehmen</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRecipe(null)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[88vh] flex flex-col gap-6 fade-in overflow-hidden shadow-2xl">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-start shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-2xl font-bold truncate pr-2">{selectedRecipe.title}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(selectedRecipe)} className="w-10 h-10 rounded-full bg-[var(--muted)]/50 flex items-center justify-center text-[var(--muted-foreground)] ios-active-scale"><Edit3 size={18} /></button>
                <button onClick={() => deleteRecipe(selectedRecipe.id)} className="w-10 h-10 rounded-full bg-red-100/50 flex items-center justify-center text-red-500 ios-active-scale"><Trash2 size={18} /></button>
                <button onClick={() => setSelectedRecipe(null)} className="w-10 h-10 rounded-full bg-[var(--muted)]/50 flex items-center justify-center text-[var(--muted-foreground)] ios-active-scale"><X size={18} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-24">
              <div className="bg-[var(--card)] p-4 rounded-2xl flex justify-between items-center border border-[var(--border)]/5 shadow-sm shrink-0">
                <div className="flex items-center gap-2 font-bold text-sm tracking-tight"><Scale size={18} className="text-[var(--primary)]" /> Portionen anpassen</div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setPortions(Math.max(1, portions - 1))} className="w-9 h-9 rounded-full bg-[var(--muted)]/50 flex items-center justify-center font-bold text-xl active:bg-[var(--muted)] transition-colors">-</button>
                  <span className="font-bold text-xl w-4 text-center">{portions}</span>
                  <button onClick={() => setPortions(portions + 1)} className="w-9 h-9 rounded-full bg-[var(--muted)]/50 flex items-center justify-center font-bold text-xl active:bg-[var(--muted)] transition-colors">+</button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Zutaten</h3>
                <div className="bg-[var(--card)] rounded-[24px] border border-[var(--border)]/5 shadow-sm overflow-hidden divide-y divide-[var(--border)]/5">
                   <p className="p-4 text-xs font-bold text-[var(--muted-foreground)] text-center">Tippe auf Bearbeiten, um Zutaten zu sehen.</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Anleitung</h3>
                <div className="p-5 bg-[var(--card)] rounded-[24px] text-[16px] font-medium leading-relaxed shadow-sm border border-[var(--border)]/5 whitespace-pre-wrap">{selectedRecipe.instructions || "Keine Anleitung hinterlegt."}</div>
              </div>

              <button onClick={() => addToShoppingList(selectedRecipe)} className="w-full bg-[var(--foreground)] text-[var(--background)] py-5 rounded-[24px] font-bold flex items-center justify-center gap-3 shadow-lg ios-active-scale mt-4 shrink-0"><ShoppingBag size={22} /> Auf Einkaufsliste setzen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
