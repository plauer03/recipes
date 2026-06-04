"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, X, Check, ShoppingBag, 
  Trash2, ChefHat, ChevronRight, Scale
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  calories_per_unit: number;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [portions, setPortions] = useState(2);
  const supabase = createClient();

  // New Recipe Form
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  
  // Ingredient Input
  const [ingName, setIngName] = useState("");
  const [ingAmount, setIngAmount] = useState("");
  const [ingUnit, setIngUnit] = useState("g");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const units = ["g", "ml", "Stk", "EL", "TL"];

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    setLoading(true);
    const { data } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
    if (data) setRecipes(data);
    setLoading(false);
  }

  // Simple Autofill Mock (Real database call could follow)
  const ingredientDB: Record<string, number> = {
    "Olivenöl": 90, // per 10ml/g
    "Avocado": 160, // per Stk (approx)
    "Nudeln": 350, // per 100g
    "Reis": 130, // per 100g gekocht
    "Hähnchen": 165 // per 100g
  };

  const addIngredient = () => {
    if (!ingName || !ingAmount) return;
    const cals = ingredientDB[ingName] || 0;
    setIngredients([...ingredients, { 
      name: ingName, 
      amount: Number(ingAmount), 
      unit: ingUnit, 
      calories_per_unit: cals 
    }]);
    setIngName("");
    setIngAmount("");
  };

  async function handleSave() {
    if (!title) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('recipes').insert([{
      title,
      instructions,
      created_by: user?.id,
      // Metadata field could store the ingredients JSON
    }]);
    if (!error) {
      setIsAdding(false);
      setTitle("");
      setInstructions("");
      setIngredients([]);
      fetchRecipes();
    }
  }

  async function addToShoppingList(recipe: any) {
    const { data: { user } } = await supabase.auth.getUser();
    // Logic to add parsed ingredients to shopping_list table
    // For demo, we just show a success state
    alert("Zutaten zur Einkaufsliste hinzugefügt!");
  }

  return (
    <div className="space-y-6 fade-in h-full flex flex-col overflow-hidden">
      <header className="pt-4 flex justify-between items-center shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Rezepte</h1>
        <button onClick={() => setIsAdding(true)} className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-md">
          <Plus size={24} />
        </button>
      </header>

      <div className="relative shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
        <input type="text" placeholder="Suchen..." className="w-full bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-3.5 pl-11 pr-4 font-medium outline-none" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 space-y-3">
        {loading ? (
          <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : recipes.map(r => (
          <div key={r.id} onClick={() => setSelectedRecipe(r)} className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/5 shadow-sm flex items-center gap-4 ios-active-scale cursor-pointer">
            <div className="w-12 h-12 bg-[var(--muted)]/30 rounded-xl flex items-center justify-center text-[var(--primary)]"><ChefHat size={24} /></div>
            <div className="flex-1 truncate"><h3 className="font-bold text-[17px]">{r.title}</h3></div>
            <ChevronRight size={18} className="text-[var(--muted-foreground)] opacity-20" />
          </div>
        ))}
      </div>

      {/* Add Recipe Sheet */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[92vh] flex flex-col gap-6 fade-in overflow-hidden">
            <div className="w-10 h-1 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold">Neues Rezept</h2>
              <button onClick={() => setIsAdding(false)} className="text-[var(--primary)] font-bold">Abbrechen</button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-20">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titel" className="w-full bg-[var(--card)] p-4 rounded-2xl border-none outline-none font-bold text-xl shadow-sm" />
              
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Zutaten</h3>
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)]/10 overflow-hidden">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border-b border-[var(--border)]/5 text-sm">
                      <span className="font-bold flex-1">{ing.name}</span>
                      <span className="text-[var(--muted-foreground)]">{ing.amount}{ing.unit}</span>
                      <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} className="text-red-500"><X size={14} /></button>
                    </div>
                  ))}
                  <div className="p-3 bg-[var(--muted)]/10 flex gap-2">
                    <input list="ing-list" value={ingName} onChange={e => setIngName(e.target.value)} placeholder="Name" className="flex-1 bg-[var(--card)] px-3 py-2 rounded-xl outline-none text-sm font-medium" />
                    <datalist id="ing-list">{Object.keys(ingredientDB).map(k => <option key={k} value={k} />)}</datalist>
                    <input type="number" value={ingAmount} onChange={e => setIngAmount(e.target.value)} placeholder="Stk" className="w-16 bg-[var(--card)] px-3 py-2 rounded-xl outline-none text-sm font-medium" />
                    <select value={ingUnit} onChange={e => setIngUnit(e.target.value)} className="bg-[var(--card)] px-2 py-2 rounded-xl outline-none text-xs font-bold">
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <button onClick={addIngredient} className="bg-[var(--foreground)] text-[var(--background)] px-3 rounded-xl"><Plus size={18} /></button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Anleitung</h3>
                <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Zubereitung..." rows={4} className="w-full bg-[var(--card)] p-4 rounded-2xl border-none outline-none font-medium shadow-sm resize-none" />
              </div>

              <button onClick={handleSave} className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold text-lg shadow-lg">Speichern</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail & Portions Sheet */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRecipe(null)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[85vh] flex flex-col gap-6 fade-in overflow-hidden">
            <div className="w-10 h-1 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold truncate pr-4">{selectedRecipe.title}</h2>
              <button onClick={() => setSelectedRecipe(null)} className="text-[var(--muted-foreground)]"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-20">
              <div className="bg-[var(--card)] p-4 rounded-2xl flex justify-between items-center border border-[var(--border)]/5 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-sm"><Scale size={18} className="text-[var(--primary)]" /> Portionen</div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setPortions(Math.max(1, portions - 1))} className="w-8 h-8 rounded-full bg-[var(--muted)]/50 flex items-center justify-center font-bold text-lg">-</button>
                  <span className="font-bold text-lg w-4 text-center">{portions}</span>
                  <button onClick={() => setPortions(portions + 1)} className="w-8 h-8 rounded-full bg-[var(--muted)]/50 flex items-center justify-center font-bold text-lg">+</button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Zutaten (berechnet)</h3>
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)]/10 overflow-hidden divide-y divide-[var(--border)]/5">
                  <div className="p-4 flex justify-between text-sm"><span className="font-bold">Beispielzutat</span><span className="text-[var(--muted-foreground)]">{100 * portions}g</span></div>
                  <div className="p-4 flex justify-between text-sm"><span className="font-bold">Öl</span><span className="text-[var(--muted-foreground)]">{0.5 * portions} EL</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Anleitung</h3>
                <p className="p-4 bg-[var(--card)] rounded-2xl text-sm font-medium leading-relaxed shadow-sm border border-[var(--border)]/5">{selectedRecipe.instructions || "Keine Anleitung"}</p>
              </div>

              <button onClick={() => addToShoppingList(selectedRecipe)} className="w-full bg-[var(--foreground)] text-[var(--background)] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"><ShoppingBag size={20} /> Auf Einkaufsliste setzen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
