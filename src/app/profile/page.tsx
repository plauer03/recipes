"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Settings, LogOut, 
  ChevronRight, Moon, ShieldCheck,
  Plus, X, Apple, Loader2, Search
} from "lucide-react";

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isManagingIngredients, setIsManagingIngredients] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  // Ingredients management state
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [newIngName, setNewIngName] = useState("");
  const [newIngCals, setNewIngCals] = useState("");
  const [newIngUnitType, setNewIngUnitType] = useState("g");

  const [useExternalDb, setUseExternalDb] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchIngredients();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile({ ...data, email: user.email });
        setNewName(data.name || "");
        setUseExternalDb(data.use_external_db || false);
      } else {
        setProfile({ email: user.email, name: "" });
      }
    }
  }

  const toggleExternalDb = async () => {
    const newVal = !useExternalDb;
    setUseExternalDb(newVal);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ use_external_db: newVal }).eq('id', user.id);
    }
  };

  async function fetchIngredients() {
    const { data } = await supabase.from('ingredients').select('*').order('name');
    if (data) setIngredients(data);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  async function saveProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name: newName,
      });
      if (!error) {
        setIsEditingProfile(false);
        fetchProfile();
      }
    }
    setLoading(false);
  }

  async function addIngredient() {
    if (!newIngName) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('ingredients').insert([{
      name: newIngName,
      calories_per_100g: Number(newIngCals) || 0,
      unit_type: newIngUnitType,
      created_by: user?.id
    }]);
    if (!error) {
      setNewIngName("");
      setNewIngCals("");
      fetchIngredients();
    }
  }

  async function deleteIngredient(id: string) {
    await supabase.from('ingredients').delete().eq('id', id);
    fetchIngredients();
  }

  return (
    <div className="space-y-8 fade-in h-full flex flex-col overflow-hidden">
      <header className="pt-4 px-1 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 space-y-6">
        {/* User Profile Card */}
        <div 
          onClick={() => setIsEditingProfile(true)}
          className="bg-[var(--card)] p-4 rounded-2xl flex items-center gap-4 border border-[var(--border)]/10 shadow-sm ios-active-scale cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-2xl font-bold uppercase shrink-0 shadow-sm">
            {profile?.name?.[0] || profile?.email?.[0] || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{profile?.name || "Name festlegen"}</h2>
            <p className="text-[var(--muted-foreground)] text-sm truncate">{profile?.email || "Lädt..."}</p>
          </div>
          <ChevronRight size={20} className="text-[var(--muted-foreground)] opacity-30 shrink-0" />
        </div>

        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-4">Management</h3>
          <div className="bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)]/10 shadow-sm">
            <button 
              onClick={() => setIsManagingIngredients(true)}
              className="w-full flex items-center gap-4 p-4 ios-active-scale border-b border-[var(--border)]/10 active:bg-[var(--muted)]/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0">
                <Apple size={18} />
              </div>
              <span className="flex-1 text-left font-semibold">Zutaten Datenbank</span>
              <ChevronRight size={18} className="text-[var(--muted-foreground)] opacity-30" />
            </button>
            <div className="flex items-center gap-4 p-4 border-b border-[var(--border)]/10">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                <Search size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Externe Datenbank</p>
                <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-tight">OpenFoodFacts API</p>
              </div>
              <button 
                onClick={toggleExternalDb}
                className={`w-11 h-6 rounded-full transition-all relative ${useExternalDb ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${useExternalDb ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0">
                <Moon size={18} />
              </div>
              <span className="flex-1 text-left font-semibold">Dunkelmodus</span>
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`w-11 h-6 rounded-full transition-all relative ${theme === 'dark' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-[var(--card)] rounded-2xl p-4 flex items-center gap-4 ios-active-scale border border-[var(--border)]/10 text-red-500 font-bold justify-center shadow-sm active:bg-red-50 dark:active:bg-red-950/20"
        >
          <LogOut size={18} />
          Abmelden
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditingProfile(false)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[50vh] flex flex-col gap-6 fade-in shadow-2xl">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold">Profil</h2>
              <button onClick={() => setIsEditingProfile(false)} className="text-[var(--primary)] font-bold">Fertig</button>
            </div>
            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-1">Anzeigename</label>
                <input 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-[var(--card)] p-4 rounded-2xl outline-none font-bold text-lg border border-[var(--border)]/5" 
                  placeholder="Dein Name"
                />
              </div>
              <button onClick={saveProfile} disabled={loading} className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center ios-active-scale">
                {loading ? <Loader2 className="animate-spin" /> : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients Management Modal */}
      {isManagingIngredients && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsManagingIngredients(false)} />
          <div className="relative w-full max-w-[450px] bg-[var(--background)] rounded-t-[32px] p-6 h-[92vh] flex flex-col gap-6 fade-in shadow-2xl overflow-hidden">
            <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full mx-auto shrink-0" />
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold">Zutaten</h2>
              <button onClick={() => setIsManagingIngredients(false)} className="text-[var(--primary)] font-bold active:opacity-50 px-2">Fertig</button>
            </div>

            <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]/10 shadow-sm space-y-3 shrink-0">
              <input 
                value={newIngName}
                onChange={e => setNewIngName(e.target.value)}
                placeholder="Name der Zutat"
                className="w-full bg-[var(--muted)]/20 p-3.5 rounded-xl outline-none font-bold text-sm"
              />
              <div className="flex gap-2 h-12">
                <input 
                  type="number"
                  value={newIngCals}
                  onChange={e => setNewIngCals(e.target.value)}
                  placeholder={`kcal / 100${newIngUnitType}`}
                  className="flex-1 bg-[var(--muted)]/20 px-4 rounded-xl outline-none font-bold text-sm"
                />
                <select 
                  value={newIngUnitType} 
                  onChange={e => setNewIngUnitType(e.target.value)}
                  className="w-20 bg-[var(--muted)]/20 px-3 rounded-xl outline-none font-bold text-sm appearance-none text-center border-none"
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                </select>
                <button 
                  onClick={addIngredient}
                  className="bg-[var(--primary)] text-white aspect-square h-full rounded-xl flex items-center justify-center shadow-md ios-active-scale shrink-0"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-10">
              {ingredients.length > 0 ? ingredients.map((ing) => (
                <div key={ing.id} className="bg-[var(--card)] p-4 rounded-2xl flex justify-between items-center border border-[var(--border)]/5 group shadow-sm mx-1">
                  <div className="flex flex-col">
                    <span className="font-bold">{ing.name}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-tight">
                      {ing.calories_per_100g} kcal / 100{ing.unit_type || 'g'}
                    </span>
                  </div>
                  <button onClick={() => deleteIngredient(ing.id)} className="text-red-500/30 active:text-red-500 p-2 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              )) : (
                <div className="py-20 text-center opacity-30">
                  <Apple size={48} className="mx-auto mb-2" />
                  <p className="text-sm font-bold uppercase">Keine Einträge</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
