"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ShoppingBag, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ShoppingListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
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
    const newStatus = !currentStatus;
    setItems(items.map(item => item.id === id ? { ...item, is_checked: newStatus } : item));
    await supabase.from('shopping_list').update({ is_checked: newStatus }).eq('id', id);

    if (newStatus) {
      timeoutRefs.current[id] = setTimeout(async () => {
        const { error } = await supabase.from('shopping_list').delete().eq('id', id);
        if (!error) {
          setItems(prev => prev.filter(i => i.id !== id));
        }
      }, 3000);
    } else {
      if (timeoutRefs.current[id]) {
        clearTimeout(timeoutRefs.current[id]);
        delete timeoutRefs.current[id];
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-full pb-10" style={{ fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Sticky Top Header with SafeArea */}
      <header 
        className="sticky top-0 z-20 flex items-end justify-between px-5 pb-3 bg-background/90 backdrop-blur-xl border-b border-border w-full"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
      >
        <span
          className="text-xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display, system-ui)' }}
        >
          Einkaufsliste
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
          {items.filter(i => !i.is_checked).length} Offen
        </span>
      </header>

      <div className="px-5 pt-6 space-y-4">
        {items.length > 0 ? (
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border">
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`flex items-center gap-4 p-4 transition-all duration-500 ${item.is_checked ? "opacity-40" : "opacity-100"}`}
              >
                <button 
                  onClick={() => toggleItem(item.id, item.is_checked)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    item.is_checked ? "bg-foreground border-foreground text-background" : "border-muted-foreground/30"
                  }`}
                >
                  {item.is_checked && <Check size={16} strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-[15px] text-foreground truncate ${item.is_checked ? "line-through" : ""}`}>
                    {item.ingredient_name || item.ingredients?.name || "Unbekannte Zutat"}
                  </p>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                    {item.original_amount ? Math.round(item.original_amount * 10) / 10 : item.amount_in_grams} {item.unit || item.ingredients?.unit_type || 'g'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
            <ShoppingBag size={48} className="text-muted-foreground opacity-30 mb-4" />
            <p className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Liste ist leer</p>
          </div>
        )}
      </div>
    </div>
  );
}
