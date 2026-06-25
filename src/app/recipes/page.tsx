"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, X, Check, ShoppingBag, 
  Trash2, ChefHat, ChevronRight, Scale,
  Loader2, AlertCircle, Edit3, Flame, Tag, Heart, Play, Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import RecipeDetailModal from "@/components/RecipeDetailModal";

interface ParsedIngredient {
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  // List State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [rawIngredientsText, setRawIngredientsText] = useState("");
  const [parsedIngredients, setParsedIngredients] = useState<ParsedIngredient[]>([]);
  const [basePortions, setBasePortions] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    fetchUser();
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    setLoading(true);
    const { data } = await supabase
      .from('recipes')
      .select('*, profiles:created_by(name)')
      .order('created_at', { ascending: false });
    
    if (data) setRecipes(data);
    setLoading(false);
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAnalyzeIngredients = async () => {
    if (!rawIngredientsText.trim()) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/parse-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawIngredientsText })
      });
      
      let data;
      const responseText = await res.text();
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("API Error (Not JSON):", responseText);
        throw new Error("Der Server ist noch nicht bereit oder hat einen Fehler (Vercel Build läuft evtl. noch). Bitte gleich nochmal probieren.");
      }
      
      if (!res.ok) throw new Error(data.error || 'Fehler bei der Analyse');
      
      setParsedIngredients(data.ingredients);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Fehler beim Berechnen der Zutaten.");
    } finally {
      setAnalyzing(false);
    }
  };

  const updateParsedIngredient = (index: number, field: keyof ParsedIngredient, value: number | string) => {
    const updated = [...parsedIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setParsedIngredients(updated);
  };

  async function handleSave() {
    if (!title) return;
    setSaving(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht eingeloggt");

      const total_calories = parsedIngredients.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
      const total_protein = parsedIngredients.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
      const total_carbs = parsedIngredients.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
      const total_fat = parsedIngredients.reduce((sum, item) => sum + (Number(item.fat) || 0), 0);

      const recipeObj: any = {
        title,
        instructions,
        base_portions: basePortions,
        tags: selectedTags,
        created_by: user.id,
        raw_ingredients_text: rawIngredientsText,
        ingredients_data: parsedIngredients,
        total_calories,
        total_protein,
        total_carbs,
        total_fat
      };

      if (editingId) {
        const { error: upErr } = await supabase.from('recipes').update(recipeObj).eq('id', editingId);
        if (upErr) throw upErr;
      } else {
        const { error: insErr } = await supabase.from('recipes').insert([recipeObj]);
        if (insErr) throw insErr;
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
    setBasePortions(recipe.base_portions || 1);
    setSelectedTags(recipe.tags || []);
    setRawIngredientsText(recipe.raw_ingredients_text || "");
    setParsedIngredients(recipe.ingredients_data || []);
    setIsAdding(true);
    setSelectedRecipe(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setInstructions("");
    setRawIngredientsText("");
    setParsedIngredients([]);
    setBasePortions(1);
    setSelectedTags([]);
    setError(null);
  };

  async function toggleFavorite(recipe: any) {
    const newStatus = !recipe.is_favorite;
    setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...r, is_favorite: newStatus } : r));
    await supabase.from('recipes').update({ is_favorite: newStatus }).eq('id', recipe.id);
  }

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
            <div key={r.id} onClick={() => setSelectedRecipe(r)} className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/5 shadow-sm flex flex-col gap-3 ios-active-scale cursor-pointer">
              <div className="flex items-center gap-4">
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
              
              {/* Macro Preview Badges */}
              {r.total_calories > 0 && (
                <div className="flex gap-2 mt-1 pt-2 border-t border-[var(--border)]/5">
                  <div className="bg-orange-500/10 text-orange-600 px-2 py-1 rounded-md text-[10px] font-bold">🔥 {Math.round(r.total_calories / (r.base_portions || 1))} kcal</div>
                  <div className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded-md text-[10px] font-bold">🥩 {Math.round(r.total_protein / (r.base_portions || 1))}g</div>
                  <div className="bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-md text-[10px] font-bold">🍞 {Math.round(r.total_carbs / (r.base_portions || 1))}g</div>
                  <div className="bg-red-500/10 text-red-600 px-2 py-1 rounded-md text-[10px] font-bold">🥑 {Math.round(r.total_fat / (r.base_portions || 1))}g</div>
                </div>
              )}
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
              <button onClick={handleSave} disabled={!title || saving || parsedIngredients.length === 0} className="text-[var(--primary)] font-bold px-2 active:opacity-50 transition-opacity">Speichern</button>
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

              {/* Natural Language Ingredients */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Zutaten</h3>
                <textarea 
                  value={rawIngredientsText} 
                  onChange={e => {
                    setRawIngredientsText(e.target.value);
                    if (parsedIngredients.length > 0) setParsedIngredients([]); // Reset if changed
                  }} 
                  placeholder="2 Bananen&#10;100g Haferflocken&#10;1 EL Honig" 
                  rows={4} 
                  className="w-full bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/10 outline-none font-medium shadow-sm resize-none leading-relaxed" 
                />
                
                {parsedIngredients.length === 0 ? (
                  <button 
                    onClick={handleAnalyzeIngredients} 
                    disabled={analyzing || !rawIngredientsText.trim()}
                    className="w-full p-4 flex items-center justify-center gap-2 text-white font-bold text-sm bg-[var(--primary)] rounded-2xl shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {analyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    Nährwerte berechnen
                  </button>
                ) : (
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)]/10 overflow-hidden shadow-sm">
                    <div className="p-3 bg-[var(--muted)]/20 border-b border-[var(--border)]/10 text-xs font-bold flex justify-between text-[var(--muted-foreground)]">
                      <span>KI Analyse (Bitte prüfen)</span>
                      <span>Kcal / P / C / F</span>
                    </div>
                    {parsedIngredients.map((ing, i) => (
                      <div key={i} className="p-3 border-b border-[var(--border)]/5 text-sm animate-in fade-in space-y-2">
                        <div className="flex justify-between items-center font-bold">
                          <span>{ing.amount} {ing.unit} {ing.name}</span>
                          <button onClick={() => setParsedIngredients(parsedIngredients.filter((_, idx) => idx !== i))} className="text-red-500/40 p-1"><X size={16} /></button>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          <input type="number" value={ing.calories} onChange={(e) => updateParsedIngredient(i, 'calories', Number(e.target.value))} className="bg-[var(--background)] px-1 py-1 rounded text-center text-xs font-bold text-orange-600 outline-none w-full" title="Kalorien" />
                          <input type="number" value={ing.protein} onChange={(e) => updateParsedIngredient(i, 'protein', Number(e.target.value))} className="bg-[var(--background)] px-1 py-1 rounded text-center text-xs font-bold text-blue-600 outline-none w-full" title="Protein" />
                          <input type="number" value={ing.carbs} onChange={(e) => updateParsedIngredient(i, 'carbs', Number(e.target.value))} className="bg-[var(--background)] px-1 py-1 rounded text-center text-xs font-bold text-yellow-600 outline-none w-full" title="Kohlenhydrate" />
                          <input type="number" value={ing.fat} onChange={(e) => updateParsedIngredient(i, 'fat', Number(e.target.value))} className="bg-[var(--background)] px-1 py-1 rounded text-center text-xs font-bold text-red-600 outline-none w-full" title="Fett" />
                        </div>
                      </div>
                    ))}
                    <div className="p-3 bg-[var(--muted)]/10 flex justify-between font-bold text-xs uppercase tracking-widest">
                      <span>Gesamt:</span>
                      <div className="flex gap-2">
                        <span className="text-orange-600">{parsedIngredients.reduce((s, i) => s + Number(i.calories || 0), 0)} kcal</span>
                        <span className="text-blue-600">{parsedIngredients.reduce((s, i) => s + Number(i.protein || 0), 0)}g</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2">Zubereitung</h3>
                <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Schritte..." rows={6} className="w-full bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/10 outline-none font-medium shadow-sm resize-none leading-relaxed" />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedRecipe && (
        <RecipeDetailModal 
          recipe={selectedRecipe} 
          currentUserId={currentUserId}
          onClose={() => setSelectedRecipe(null)} 
          onEdit={startEdit}
          onDelete={deleteRecipe}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}
