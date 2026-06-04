"use client";

import { useState, useEffect } from "react";
import { Check, ShoppingBag, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ShoppingListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    // Fetch items and join with ingredients to get the name
    const { data, error } = await supabase
      .from('shopping_list')
      .select(`
        *,
        ingredients (
          name
        )
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) setItems(data);
    setLoading(false);
  }

  const toggleItem = async (id: string, currentStatus: boolean) => {
    setItems(items.map(item => item.id === id ? { ...item, is_checked: !currentStatus } : item));
    await supabase.from('shopping_list').update({ is_checked: !currentStatus }).eq('id', id);

    if (!currentStatus) {
      setTimeout(async () => {
        await supabase.from('shopping_list').delete().eq('id', id);
        setItems(prev => prev.filter(i => i.id !== id));
      }, 3000);
    }
  };

  const addItem = async () => {
    if (!newItem) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optional: Search if ingredient exists, or just show alert
    alert("Zutaten können aktuell nur über Rezepte oder die Datenbank (zukünftig) hinzugefügt werden.");
    setNewItem("");
  };

  return (
    <div className="space-y-6 fade-in h-full flex flex-col overflow-hidden">
      <header className="pt-4 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight px-1">Einkauf</h1>
          <p className="text-[var(--muted-foreground)] text-sm font-medium px-1">
            {items.filter(i => !i.is_checked).length} Artikel offen
          </p>
        </div>
        <ShoppingBag className="text-[var(--primary)] opacity-20 mb-1" size={32} />
      </header>

      <div className="px-1 flex gap-2 shrink-0">
        <input 
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Zutat suchen..." 
          className="flex-1 bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-4 px-6 font-medium outline-none shadow-sm"
        />
        <button onClick={addItem} className="w-14 h-14 rounded-2xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center shadow-md">
          <Plus size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 space-y-4 px-1">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[var(--primary)]" /></div>
        ) : items.length > 0 ? (
          <div className="bg-[var(--card)] rounded-[28px] border border-[var(--border)]/5 shadow-sm overflow-hidden divide-y divide-[var(--border)]/5">
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`flex items-center gap-4 p-5 transition-all duration-500 ${item.is_checked ? "opacity-30 translate-x-2" : "opacity-100"}`}
              >
                <button 
                  onClick={() => toggleItem(item.id, item.is_checked)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    item.is_checked ? "bg-green-500 border-green-500 text-white" : "border-[var(--border)]"
                  }`}
                >
                  {item.is_checked && <Check size={16} strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-[17px] truncate ${item.is_checked ? "line-through" : ""}`}>
                    {item.ingredients?.name || "Unbekannte Zutat"}
                  </p>
                  {item.amount_in_grams > 0 && (
                    <p className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest mt-0.5">
                      {item.amount_in_grams}g / Einheiten
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center opacity-30 grayscale">
            <ShoppingBag size={48} className="mx-auto mb-4" />
            <p className="font-bold text-sm uppercase tracking-widest">Alles erledigt!</p>
          </div>
        )}
      </div>
    </div>
  );
}
