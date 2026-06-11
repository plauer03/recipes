"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, X, Check, ShoppingBag, 
  Trash2, ChefHat, ChevronRight, Scale,
  Loader2, AlertCircle, Edit3, Flame, Tag, Heart, Play
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import RecipeDetailModal from "@/components/RecipeDetailModal";

interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories_per_100g: number;
  isExternal?: boolean;
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
  const supabase = createClient();

  // List State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredientsList, setIngredientsList] = useState<RecipeIngredient[]>([]);
  const [basePortions, setBasePortions] = useState(1);
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
    }, 350);
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
      const res = await fetch(`https://www.teitge.de/wp-json/food-api/v1/foods?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && typeof data === 'object') {
        const items = Object.values(data);
        const mapped = items.map((p: any) => ({
          id: `ext-${p.id}`,
          name: `${p.name}${p.subname ? ` (${p.subname})` : ""}`,
          calories_per_100g: Math.round(p["Energie (kcal)"] || 0),
          isExternal: true
        })).filter((p: any) => p.calories_per_100g > 0);
        setExternalResults(mapped);
      }
    } catch (err) {
      console.error(err);
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
      calories_per_100g: currentPickingIng.calories_per_100g,
      isExternal: currentPickingIng.isExternal
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

      const processedIngredients = [];
      for (const ing of ingredientsList) {
        if (ing.isExternal) {
          const { data: existing } = await supabase.from('ingredients').select('id').eq('name', ing.name).eq('created_by', user.id).maybeSingle();
          if (existing) {
            processedIngredients.push({ ...ing, id: existing.id });
          } else {
            const { data: created, error: createErr } = await supabase.from('ingredients').insert([{
              name: ing.name,
              calories_per_100g: ing.calories_per_100g,
              created_by: user.id
            }]).select().single();
            if (createErr) throw createErr;
            processedIngredients.push({ ...ing, id: created.id });
          }
        } else {
          processedIngredients.push(ing);
        }
      }

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

      if (processedIngredients.length > 0 && recipeId) {
        const links = processedIngredients.map(ing => ({
          recipe_id: recipeId,
          ingredient_id: ing.id,
          amount: ing.amount,
          unit: ing.unit
        }));
        const { error: linkErr } = await supabase.from('recipe_ingredients').insert(links);
        if (linkErr) throw linkErr;
      }

      setIsAdding(false);
      resetForm();
      fetchRecipes();
      fetchAvailableIngredients();
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
    setBasePortions(recipe.base_portions || 1);
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
    setBasePortions(1);
    setSelectedTags([]);
    setError(null);
  };

  async function toggleFavorite(recipe: any) {
    const newStatus = !recipe.is_favorite;
    setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...r, is_favorite: newStatus } : r));
    await supabase.from('recipes').update({ is_favorite: newStatus }).eq('id', recipe.id);
  }

  const filteredIngredients = availableIngredients.filter(ing => 
    ing.name.toLowerCase().includes(ingSearchQuery.toLowerCase())
  );

  const displayedRecipes = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'Favorites' 
      ? r.is_favorite 
      : activeFilter ? r.tags?.includes(activeFilter) : true;
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
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rezepte suchen..." className="w-full bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-3.5 pl-11 pr-4 font-medium outline-none shadow-sm" />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
          <button onClick={() => setActiveFilter(null)} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${!activeFilter ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]" : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)]/10"}`}>Alle</button>
          <button 
            onClick={() => setActiveFilter('Favorites')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
              activeFilter === 'Favorites' 
                ? "bg-pink-500 text-white border-pink-500 shadow-sm" 
                : "bg-[var(--card)] text-pink-500 border-pink-500/20"
            }`}
          >
            <Heart size={14} className={activeFilter === 'Favorites' ? 'fill-white' : 'fill-pink-500'} />
            Favoriten
          </button>
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
            <div key={r.id} onClick={() => setSelectedRecipe(r)} className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/5 shadow-sm flex items-center gap-4 ios-active-scale cursor-pointer">
              <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center text-[var(--primary)] shrink-0"><ChefHat size={24} /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[17px] truncate flex items-center gap-2">
                  {r.title}
                  {r.is_favorite && <Heart size={14} className="fill-pink-500 text-pink-500" />}
                </h3>
                <div className="flex gap-2 mt-1 overflow-hidden">
                  <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-tight opacity-60 shrink-0 border-r border-[var(--border)]/20 pr-2">Basis: {r.base_portions || 1} Pers.</p>
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
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[90dvh] flex flex-col gap-6 fade-in shadow-2xl overflow-hidden">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold tracking-tight">{editingId ? "Bearbeiten" : "Neues Rezept"}</h2>
              <button onClick={handleSave} disabled={!title || saving} className="text-[var(--primary)] font-bold px-2 active:opacity-50 transition-opacity">Speichern</button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold shrink-0 shadow-sm border border-red-100"><AlertCircle size={16} /> {error}</div>}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-20">
              <div className="space-y-4">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titel" className="w-full bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/10 outline-none font-bold text-xl shadow-sm" />
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
            </div>
          </div>
        </div>
      )}
{/* Ingredient Picker Modal */}
{isSelectingIngredient && (
  <div className="fixed inset-0 z-[150] flex items-end justify-center px-0">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSelectingIngredient(false)} />
    <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[90dvh] flex flex-col gap-6 fade-in shadow-2xl overflow-hidden">

            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            {!currentPickingIng ? (
              <>
                <div className="flex justify-between items-center shrink-0">
                  <h2 className="text-xl font-bold tracking-tight">Zutat wählen</h2>
                  <button onClick={() => setIsSelectingIngredient(false)} className="text-[var(--primary)] font-bold px-2 active:opacity-50">Abbrechen</button>
                </div>
                <div className="relative shrink-0 px-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
                  <input type="text" placeholder="Suchen..." value={ingSearchQuery} onChange={e => setIngSearchQuery(e.target.value)} className="w-full bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-3.5 pl-11 pr-4 font-medium outline-none shadow-sm" />
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-10 px-1">
                  {filteredIngredients.map(ing => (
                    <button key={ing.id} onClick={() => handlePickIngredient(ing)} className="w-full bg-[var(--card)] p-4 rounded-2xl flex justify-between items-center border border-[var(--border)]/5 ios-active-scale text-left">
                      <div className="flex flex-col"><span className="font-bold">{ing.name}</span><span className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Deine Datenbank</span></div>
                      <ChevronRight size={18} className="opacity-20" />
                    </button>
                  ))}
                  {externalResults.map(ing => (
                    <button key={ing.id} onClick={() => handlePickIngredient(ing)} className="w-full bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-2xl flex justify-between items-center border border-blue-100/20 dark:border-blue-800/20 text-left active:opacity-70">
                      <div className="flex flex-col"><span className="font-bold">{ing.name}</span><span className="text-[10px] text-blue-500 font-bold uppercase">Datenbank • {ing.calories_per_100g} kcal</span></div>
                      <ChevronRight size={18} className="text-blue-500 opacity-40" />
                    </button>
                  ))}
                  {isSearchingExternal && <div className="py-4 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={20} /></div>}
                </div>
              </>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col overflow-hidden px-1">
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentPickingIng(null)} className="p-2 -ml-2 text-[var(--primary)] font-bold">Zurück</button>
                    <h2 className="text-xl font-bold truncate">{currentPickingIng.name}</h2>
                  </div>
                  <button onClick={confirmIngredient} disabled={!ingAmount} className="text-[var(--primary)] font-bold px-2 ios-active-scale">Übernehmen</button>
                </div>
                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Menge & Einheit</label>
                    <div className="flex gap-2 h-14">
                      <input type="number" value={ingAmount} onChange={e => setIngAmount(e.target.value)} placeholder="0" className="flex-1 bg-[var(--card)] px-4 rounded-2xl outline-none font-bold text-lg shadow-sm border border-[var(--border)]/5" autoFocus />
                      <select value={ingUnit} onChange={e => setIngUnit(e.target.value)} className="w-24 bg-[var(--card)] px-2 rounded-2xl outline-none font-bold appearance-none text-center shadow-sm border border-[var(--border)]/5">{units.map(u => <option key={u} value={u}>{u}</option>)}</select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedRecipe && (
        <RecipeDetailModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
          onEdit={startEdit}
          onDelete={deleteRecipe}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}
