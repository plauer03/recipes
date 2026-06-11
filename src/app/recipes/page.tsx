"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, X, Check, ShoppingBag, 
  Trash2, ChefHat, ChevronRight, Scale,
  Loader2, AlertCircle, Edit3, Flame, Tag, Heart
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories_per_100g: number;
}

const AVAILABLE_TAGS = [
  "Frühstück", "Hauptspeise", "Beilage", "Snack", "Dessert", 
  "Schnell", "Meal Prep", "Vegan", "Vegetarisch", "High Protein", "Low Carb",
  "Italienisch", "Asiatisch", "Mediterran", "Deutsch"
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
  const [portions, setPortions] = useState(2);
  const supabase = createClient();

  // List State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredientsList, setIngredientsList] = useState<RecipeIngredient[]>([]);
  const [basePortions, setBasePortions] = useState(2);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Selection State
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  const [isSelectingIngredient, setIsSelectingIngredient] = useState(false);
  const [currentPickingIng, setCurrentPickingIng] = useState<any>(null);
  const [ingSearchQuery, setIngSearchQuery] = useState("");
  const [externalResults, setExternalResults] = useState<any[]>([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [ingAmount, setIngAmount] = useState("");
  const [ingUnit, setIngUnit] = useState("g");

  const units = ["g", "ml", "EL", "TL", "Stk"];

  useEffect(() => {
    fetchRecipes();
    fetchAvailableIngredients();
  }, []);

  useEffect(() => {
    if (ingSearchQuery.length <= 2) {
      setExternalResults([]);
      setIsSearchingExternal(false);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      searchExternalIngredients(ingSearchQuery);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [ingSearchQuery]);

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

  async function searchExternalIngredients(query: string) {
    const { data: profile } = await supabase.from('profiles').select('use_external_db').single();
    if (!profile?.use_external_db) return;

    setIsSearchingExternal(true);
    try {
      // Use standard world subdomain but filter for German names and common brands
      const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=code,product_name_de,product_name,nutriments,brands`);
      const data = await res.json();
      if (data.products) {
        const mapped = data.products
          .filter((p: any) => p.nutriments && (p.nutriments['energy-kcal_100g'] !== undefined))
          .map((p: any) => {
            const name = p.product_name_de || p.product_name || "Unbekannt";
            const brand = p.brands ? ` (${p.brands.split(',')[0]})` : "";
            return {
              id: `ext-${p.code}`,
              name: `${name}${brand}`,
              calories_per_100g: Math.round(p.nutriments['energy-kcal_100g']),
              isExternal: true
            };
          });
        setExternalResults(mapped);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearchingExternal(false);
    }
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
    setIngSearchQuery("");
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
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
        tags: selectedTags,
        created_by: user.id,
      };

      let recipeId = editingId;

      if (editingId) {
        const { error: upErr } = await supabase.from('recipes').update(recipeObj).eq('id', editingId);
        if (upErr) throw upErr;
        await supabase.from('recipe_ingredients').delete().eq('recipe_id', editingId);
      } else {
        const { data: insData, error: insErr } = await supabase.from('recipes').insert([recipeObj]).select().single();
        if (insErr) throw insErr;
        recipeId = insData.id;
      }

      if (ingredientsList.length > 0 && recipeId) {
        const links = ingredientsList.map(ing => ({
          recipe_id: recipeId,
          ingredient_id: ing.id.startsWith('ext-') ? null : ing.id, // Handle external later or skip
          amount: ing.amount,
          unit: ing.unit
        }));
        const { error: linkErr } = await supabase.from('recipe_ingredients').insert(links);
        if (linkErr) throw linkErr;
      }

      setIsAdding(false);
      resetForm();
      fetchRecipes();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Fehler beim Speichern.");
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
    setSelectedTags(recipe.tags || []);
    
    const { data: ings } = await supabase
      .from('recipe_ingredients')
      .select('*, ingredients(name, calories_per_100g)')
      .eq('recipe_id', recipe.id);
    
    if (ings) {
      setIngredientsList(ings.map((i: any) => ({
        id: i.ingredient_id,
        name: i.ingredients?.name || "Unbekannt",
        amount: i.amount,
        unit: i.unit || 'g',
        calories_per_100g: i.ingredients?.calories_per_100g || 0
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
    setSelectedTags([]);
    setError(null);
  };

  const openRecipeDetails = async (recipe: any) => {
    setSelectedRecipe(recipe);
    setPortions(recipe.base_portions || 2);
    setRecipeIngredients([]); 
    
    const { data: ings } = await supabase
      .from('recipe_ingredients')
      .select('*, ingredients(name, unit_type, calories_per_100g)')
      .eq('recipe_id', recipe.id);
    
    if (ings) setRecipeIngredients(ings);
  };

  async function toggleFavorite(recipe: any) {
    const newStatus = !recipe.is_favorite;
    
    // UI Feedback immediately
    setSelectedRecipe({ ...recipe, is_favorite: newStatus });
    setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...r, is_favorite: newStatus } : r));

    const { error } = await supabase
      .from('recipes')
      .update({ is_favorite: newStatus })
      .eq('id', recipe.id);

    if (error) {
      console.error("Favorite save error:", error);
      // Revert UI if it fails
      setSelectedRecipe({ ...recipe, is_favorite: !newStatus });
      setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...r, is_favorite: !newStatus } : r));
      alert("Fehler: Favorit konnte nicht gespeichert werden.");
    }
  }

  async function addToShoppingList() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedRecipe) return;

    if (recipeIngredients.length > 0) {
      const scale = portions / (selectedRecipe.base_portions || 2);
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

  const getCaloriesPerPortion = () => {
    if (!selectedRecipe || !recipeIngredients || recipeIngredients.length === 0) return 0;
    
    let totalCals = 0;
    for (const ing of recipeIngredients) {
      let amountInGrams = ing.amount;
      if (ing.unit === 'EL') amountInGrams *= 15;
      if (ing.unit === 'TL') amountInGrams *= 5;
      if (ing.unit === 'Stk') amountInGrams *= 100;
      
      const calsPer100 = ing.ingredients?.calories_per_100g || 0;
      totalCals += (amountInGrams / 100) * calsPer100;
    }
    
    return Math.round(totalCals / (selectedRecipe.base_portions || 2));
  };

  const filteredIngredients = availableIngredients.filter(ing => 
    ing.name.toLowerCase().includes(ingSearchQuery.toLowerCase())
  );

  const displayedRecipes = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter ? r.tags?.includes(activeFilter) : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 fade-in h-full flex flex-col overflow-hidden">
      <header className="pt-2 flex justify-between items-center shrink-0">
        <h1 className="text-3xl font-bold tracking-tight px-1">Rezepte</h1>
        <button onClick={() => { resetForm(); setIsAdding(true); }} className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-lg ios-active-scale">
          <Plus size={24} />
        </button>
      </header>

      <div className="space-y-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rezepte suchen..." 
            className="w-full bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-3.5 pl-11 pr-4 font-medium outline-none shadow-sm" 
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
          <button onClick={() => setActiveFilter(null)} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${!activeFilter ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]" : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)]/10"}`}>Alle</button>
          {AVAILABLE_TAGS.map(tag => (
            <button key={tag} onClick={() => setActiveFilter(tag)} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${activeFilter === tag ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)]/10"}`}>{tag}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 space-y-3 px-1 pt-1">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[var(--primary)]" /></div>
        ) : displayedRecipes.length > 0 ? (
          displayedRecipes.map(r => (
            <div key={r.id} onClick={() => openRecipeDetails(r)} className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/5 shadow-sm flex items-center gap-4 ios-active-scale cursor-pointer">
              <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center text-[var(--primary)] shrink-0"><ChefHat size={24} /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[17px] truncate flex items-center gap-2">
                  {r.title}
                  {r.is_favorite && <Heart size={14} className="fill-pink-500 text-pink-500" />}
                </h3>
                <div className="flex gap-2 mt-1 overflow-hidden">
                  <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-tight opacity-60 shrink-0 border-r border-[var(--border)]/20 pr-2">Basis: {r.base_portions || 2} Pers.</p>
                  <p className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-tight truncate">{r.tags?.join(' • ')}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--muted-foreground)] opacity-20 shrink-0" />
            </div>
          ))
        ) : (
          <div className="py-20 text-center opacity-30">
            <ChefHat size={48} className="mx-auto mb-4" />
            <p className="font-bold text-sm uppercase tracking-widest">Keine Rezepte</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setIsAdding(false)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[94vh] flex flex-col gap-6 fade-in shadow-2xl overflow-hidden">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold tracking-tight">{editingId ? "Bearbeiten" : "Neues Rezept"}</h2>
              <button onClick={() => setIsAdding(false)} disabled={saving} className="text-[var(--primary)] font-bold">Fertig</button>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold shrink-0"><AlertCircle size={16} /> {error}</div>}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-32">
              <div className="space-y-4">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Rezept Titel" className="w-full bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/10 outline-none font-bold text-xl shadow-sm" />
                <div className="bg-[var(--card)] p-4 rounded-2xl flex justify-between items-center border border-[var(--border)]/10 shadow-sm">
                  <span className="font-bold text-sm">Basis Portionen</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setBasePortions(Math.max(1, basePortions - 1))} className="w-9 h-9 rounded-full bg-[var(--muted)]/50 flex items-center justify-center font-bold ios-active-scale">-</button>
                    <span className="font-bold text-lg">{basePortions}</span>
                    <button onClick={() => setBasePortions(basePortions + 1)} className="w-9 h-9 rounded-full bg-[var(--muted)]/50 flex items-center justify-center font-bold ios-active-scale">+</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${selectedTags.includes(tag) ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)]/10"}`}>{tag}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Zutaten</h3>
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)]/10 overflow-hidden shadow-sm">
                  {ingredientsList.map((ing, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border-b border-[var(--border)]/5 text-sm animate-in fade-in">
                      <span className="font-bold flex-1">{ing.name}</span>
                      <span className="text-[var(--muted-foreground)] font-bold">{ing.amount}{ing.unit}</span>
                      <button onClick={() => setIngredientsList(ingredientsList.filter((_, idx) => idx !== i))} className="text-red-500/40 p-1"><X size={18} /></button>
                    </div>
                  ))}
                  <button onClick={() => setIsSelectingIngredient(true)} className="w-full p-4 flex items-center justify-center gap-2 text-[var(--primary)] font-bold text-sm bg-[var(--muted)]/10 active:bg-[var(--muted)]/20 transition-colors"><Plus size={18} /> Zutat hinzufügen</button>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Zubereitung</h3>
                <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Schritte..." rows={6} className="w-full bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/10 outline-none font-medium shadow-sm resize-none leading-relaxed" />
              </div>
              <button onClick={handleSave} disabled={!title || saving} className="w-full bg-[var(--primary)] text-white py-5 rounded-[24px] font-bold text-lg shadow-xl flex items-center justify-center ios-active-scale disabled:opacity-30">{saving ? <Loader2 className="animate-spin" /> : "Speichern"}</button>
            </div>
          </div>
        </div>
      )}

      {isSelectingIngredient && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSelectingIngredient(false)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[85vh] flex flex-col gap-6 fade-in shadow-2xl overflow-hidden">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            {!currentPickingIng ? (
              <>
                <div className="flex justify-between items-center shrink-0">
                  <h2 className="text-xl font-bold tracking-tight">Zutat wählen</h2>
                  <button onClick={() => setIsSelectingIngredient(false)} className="text-[var(--primary)] font-bold px-2">Abbrechen</button>
                </div>
                <div className="relative shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
                  <input type="text" placeholder="Suchen..." value={ingSearchQuery} onChange={e => setIngSearchQuery(e.target.value)} className="w-full bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-3.5 pl-11 pr-4 font-medium outline-none shadow-sm" />
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-10 px-1">
                  {filteredIngredients.map(ing => (
                    <button key={ing.id} onClick={() => handlePickIngredient(ing)} className="w-full bg-[var(--card)] p-4 rounded-2xl flex justify-between items-center border border-[var(--border)]/5 text-left active:bg-[var(--muted)]/50">
                      <div className="flex flex-col"><span className="font-bold">{ing.name}</span><span className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Deine Datenbank</span></div>
                      <ChevronRight size={18} className="opacity-20" />
                    </button>
                  ))}
                  {externalResults.map(ing => (
                    <button key={ing.id} onClick={() => handlePickIngredient(ing)} className="w-full bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-2xl flex justify-between items-center border border-blue-100/20 dark:border-blue-800/20 text-left active:opacity-70">
                      <div className="flex flex-col"><span className="font-bold">{ing.name}</span><span className="text-[10px] text-blue-500 font-bold uppercase">OpenFoodFacts • {ing.calories_per_100g} kcal</span></div>
                      <ChevronRight size={18} className="text-blue-500 opacity-40" />
                    </button>
                  ))}
                  {isSearchingExternal && <div className="py-4 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={20} /></div>}
                </div>
              </>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col overflow-hidden px-1">
                <div className="flex items-center gap-3 shrink-0"><button onClick={() => setCurrentPickingIng(null)} className="p-2 -ml-2 text-[var(--primary)] font-bold">Zurück</button><h2 className="text-xl font-bold truncate">{currentPickingIng.name}</h2></div>
                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Menge & Einheit</label>
                    <div className="flex gap-2 h-14">
                      <input type="number" value={ingAmount} onChange={e => setIngAmount(e.target.value)} placeholder="0" className="flex-1 bg-[var(--card)] px-4 rounded-2xl outline-none font-bold text-lg shadow-sm" autoFocus />
                      <select value={ingUnit} onChange={e => setIngUnit(e.target.value)} className="w-24 bg-[var(--card)] px-2 rounded-2xl outline-none font-bold appearance-none text-center shadow-sm">{units.map(u => <option key={u} value={u}>{u}</option>)}</select>
                    </div>
                  </div>
                  <button onClick={confirmIngredient} disabled={!ingAmount} className="w-full bg-[var(--foreground)] text-[var(--background)] py-4 rounded-2xl font-bold text-lg shadow-lg">Übernehmen</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRecipe(null)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[88vh] flex flex-col gap-6 fade-in shadow-2xl overflow-hidden">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-start shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-2xl font-bold truncate pr-2">{selectedRecipe.title}</h2>
                {recipeIngredients.length > 0 && <div className="flex items-center gap-1.5 mt-1 text-[var(--primary)] font-bold text-sm bg-[var(--primary)]/10 w-fit px-2.5 py-0.5 rounded-full"><Flame size={14} /> {getCaloriesPerPortion()} kcal / Port.</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleFavorite(selectedRecipe)} className={`w-10 h-10 rounded-full flex items-center justify-center ios-active-scale transition-colors ${selectedRecipe.is_favorite ? 'bg-pink-100/50 text-pink-500' : 'bg-[var(--muted)]/50 text-[var(--muted-foreground)]'}`}><Heart size={18} className={selectedRecipe.is_favorite ? 'fill-pink-500' : ''} /></button>
                <button onClick={() => startEdit(selectedRecipe)} className="w-10 h-10 rounded-full bg-[var(--muted)]/50 flex items-center justify-center text-[var(--muted-foreground)]"><Edit3 size={18} /></button>
                <button onClick={() => deleteRecipe(selectedRecipe.id)} className="w-10 h-10 rounded-full bg-red-100/50 flex items-center justify-center text-red-500"><Trash2 size={18} /></button>
                <button onClick={() => setSelectedRecipe(null)} className="w-10 h-10 rounded-full bg-[var(--muted)]/50 flex items-center justify-center text-[var(--muted-foreground)]"><X size={18} /></button>
              </div>
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
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Zutaten</h3>
                <div className="bg-[var(--card)] rounded-[24px] border border-[var(--border)]/5 shadow-sm overflow-hidden divide-y divide-[var(--border)]/5">
                  {recipeIngredients.map((ing, i) => {
                    const scale = portions / (selectedRecipe.base_portions || 2);
                    const calcAmount = Math.round(ing.amount * scale * 10) / 10;
                    return (<div key={i} className="p-4 flex justify-between items-center text-sm"><span className="font-bold">{ing.ingredients?.name || "Unbekannt"}</span><span className="font-bold text-[var(--muted-foreground)] uppercase tracking-tighter text-xs">{calcAmount} {ing.unit}</span></div>);
                  })}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Zubereitung</h3>
                <div className="p-5 bg-[var(--card)] rounded-[24px] text-[16px] font-medium leading-relaxed shadow-sm border border-[var(--border)]/5 whitespace-pre-wrap">{selectedRecipe.instructions || "Keine Anleitung hinterlegt."}</div>
              </div>
              <button onClick={addToShoppingList} className="w-full bg-[var(--foreground)] text-[var(--background)] py-5 rounded-[24px] font-bold flex items-center justify-center gap-3 shadow-lg ios-active-scale mt-4 shrink-0"><ShoppingBag size={22} /> Auf Einkaufsliste setzen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
