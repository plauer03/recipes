"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search as SearchIcon, Filter, X, 
  ChevronRight, Timer, Flame, ChefHat, 
  Trash2, Image as ImageIcon, Check 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Ingredient {
  name: string;
  amount: string;
}

export default function RecipesPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();

  // New Recipe State
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [calories, setCalories] = useState("");
  const [instructions, setInstructions] = useState("");
  const [category, setCategory] = useState("Mittagstisch");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newIngName, setNewIngName] = useState("");
  const [newIngAmount, setNewIngAmount] = useState("");

  const categories = ["Frühstück", "Mittagstisch", "Abendbrot", "Snack", "Dressing/Soße", "Beilage"];

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    setLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setRecipes(data);
    setLoading(false);
  }

  const addIngredient = () => {
    if (newIngName && newIngAmount) {
      setIngredients([...ingredients, { name: newIngName, amount: newIngAmount }]);
      setNewIngName("");
      setNewIngAmount("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('recipes')
      .insert([
        { 
          title, 
          instructions, 
          created_by: user.id,
          // Storing these as metadata or extending schema if needed
          // For now using columns we have or instructions for complexity
        }
      ])
      .select();

    if (!error) {
      setIsAdding(false);
      resetForm();
      fetchRecipes();
    }
  };

  const resetForm = () => {
    setTitle("");
    setTime("");
    setCalories("");
    setInstructions("");
    setIngredients([]);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="pt-8 px-1 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Rezepte</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-lg ios-active-scale"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* Search Bar */}
      <div className="relative group px-1">
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] opacity-50" size={18} />
        <input 
          type="text" 
          placeholder="Rezepte, Zutaten..." 
          className="w-full bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-4 pl-12 pr-12 font-medium focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none shadow-sm"
        />
        <Filter className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--primary)]" size={18} />
      </div>

      {/* Recipe List */}
      <div className="grid grid-cols-1 gap-4 px-1">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--muted-foreground)] font-medium">Rezepte werden geladen...</p>
          </div>
        ) : recipes.length > 0 ? (
          recipes.map((recipe, i) => (
            <div key={recipe.id} className="bg-[var(--card)] rounded-[24px] overflow-hidden border border-[var(--border)]/10 shadow-sm ios-active-scale p-4 flex gap-4 items-center">
              <div className="w-20 h-20 bg-[var(--muted)] rounded-2xl flex items-center justify-center text-[var(--primary)]">
                <ChefHat size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{recipe.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-1">{recipe.instructions || "Keine Anleitung"}</p>
              </div>
              <ChevronRight size={20} className="text-[var(--muted-foreground)] opacity-30" />
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-[var(--card)] flex items-center justify-center text-[var(--muted-foreground)] mx-auto border border-[var(--border)]/10">
              <BookOpenIcon />
            </div>
            <p className="text-[var(--muted-foreground)] font-medium">Noch keine Rezepte angelegt.</p>
          </div>
        )}
      </div>

      {/* Add Recipe Modal (iOS Style Sheet) */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] shadow-2xl p-6 space-y-6 animate-in slide-in-from-bottom-full duration-500 ease-out h-[92vh] overflow-y-auto no-scrollbar">
            <div className="w-12 h-1.5 bg-[var(--muted)] rounded-full mx-auto" onClick={() => setIsAdding(false)} />
            
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Neues Rezept</h2>
              <button onClick={() => setIsAdding(false)} className="text-[var(--primary)] font-bold text-lg px-2">Fertig</button>
            </div>
            
            <div className="space-y-6 pb-32">
              {/* Image Placeholder */}
              <div className="aspect-video bg-[var(--card)] rounded-3xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 text-[var(--muted-foreground)] ios-active-scale">
                <ImageIcon size={32} />
                <span className="text-sm font-bold">Bild hinzufügen</span>
              </div>

              {/* General Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Titel</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="z.B. Beste Döner Soße" 
                    className="w-full bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/10 outline-none font-bold text-lg" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Zeit (min)</label>
                    <input 
                      type="number" 
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="15" 
                      className="w-full bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/10 outline-none font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Kategorie</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/10 outline-none font-bold appearance-none"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ingredients Section */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1 flex justify-between">
                  <span>Zutaten</span>
                  <span>{ingredients.length}</span>
                </label>
                
                <div className="space-y-2">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[var(--card)] p-3 rounded-xl border border-[var(--border)]/10 animate-in slide-in-from-right-4">
                      <div className="flex-1 font-bold">{ing.name}</div>
                      <div className="text-[var(--muted-foreground)] font-medium">{ing.amount}</div>
                      <button onClick={() => removeIngredient(idx)} className="text-red-500 p-1"><X size={16} /></button>
                    </div>
                  ))}
                  
                  <div className="flex gap-2 bg-[var(--muted)]/50 p-2 rounded-2xl">
                    <input 
                      type="text" 
                      placeholder="Zutat" 
                      value={newIngName}
                      onChange={(e) => setNewIngName(e.target.value)}
                      className="flex-1 bg-transparent px-3 py-2 outline-none font-medium text-sm" 
                    />
                    <input 
                      type="text" 
                      placeholder="Menge" 
                      value={newIngAmount}
                      onChange={(e) => setNewIngAmount(e.target.value)}
                      className="w-20 bg-transparent px-3 py-2 outline-none font-medium text-sm" 
                    />
                    <button 
                      onClick={addIngredient}
                      className="bg-[var(--primary)] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Zubereitung</label>
                <textarea 
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Beschreibe die Schritte..." 
                  rows={6}
                  className="w-full bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/10 outline-none font-medium resize-none leading-relaxed" 
                />
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-[var(--primary)] text-white py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-[var(--primary)]/20 active:scale-[0.98] transition-all"
              >
                Rezept speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookOpenIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
}
