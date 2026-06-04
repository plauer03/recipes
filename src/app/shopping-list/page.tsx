"use client";

import { useState, useEffect } from "react";
import { Check, ShoppingBag, Plus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ShoppingListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('shopping_list')
      .select(`
        *,
        ingredients (
          name,
          unit_type
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setItems(data);
    setLoading(false);
  }

  const toggleItem = async (id: string, currentStatus: boolean) => {
    setItems(items.map(item => item.id === id ? { ...item, is_checked: !currentStatus } : item));
    await supabase.from('shopping_list').update({ is_checked: !currentStatus }).eq('id', id);

    if (!currentStatus) {
      setTimeout(async () => {
        const { error } = await supabase.from('shopping_list').delete().eq('id', id);
        if (!error) {
          setItems(prev => prev.filter(i => i.id !== id));
        }
      }, 3000);
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('shopping_list').delete().eq('id', id);
    if (!error) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-6 fade-in h-full flex flex-col overflow-hidden">
      <header className="pt-4 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight px-1">Einkauf</h1>
          <p className="text-[var(--muted-foreground)] text-sm font-bold px-1 uppercase tracking-widest">
            {items.filter(i => !i.is_checked).length} Artikel offen
          </p>
        </div>
        <ShoppingBag className="text-[var(--primary)] opacity-20 mb-1" size={32} />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 space-y-4 px-1">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[var(--primary)]" /></div>
        ) : items.length > 0 ? (
          <div className="bg-[var(--card)] rounded-[28px] border border-[var(--border)]/5 shadow-sm overflow-hidden divide-y divide-[var(--border)]/5">
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`flex items-center gap-4 p-5 transition-all duration-500 ${item.is_checked ? "opacity-30" : "opacity-100"}`}
              >
                <button 
                  onClick={() => toggleItem(item.id, item.is_checked)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    item.is_checked ? "bg-green-500 border-green-500 text-white" : "border-[var(--border)]"
                  }`}
                >
                  {item.is_checked && <Check size={16} strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-[17px] truncate ${item.is_checked ? "line-through" : ""}`}>
                    {item.ingredients?.name || "Unbekannte Zutat"}
                  </p>
                  <p className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest mt-0.5">
                    {item.amount_in_grams}{item.ingredients?.unit_type || 'g'}
                  </p>
                </div>
                <button onClick={() => deleteItem(item.id)} className="text-red-500/20 active:text-red-500 p-2">
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center opacity-30 grayscale">
            <ShoppingBag size={48} className="mx-auto mb-4" />
            <p className="font-bold text-sm uppercase tracking-widest px-4">Deine Einkaufsliste ist leer</p>
          </div>
        )}
      </div>
    </div>
  );
}
