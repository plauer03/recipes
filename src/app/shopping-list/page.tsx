"use client";

import { useState } from "react";
import { Check, ShoppingBag, Plus, Trash2 } from "lucide-react";

export default function ShoppingListPage() {
  const [items, setItems] = useState([
    { id: 1, name: "Quinoa", amount: "200g", checked: false },
    { id: 2, name: "Zucchini", amount: "2 Stk", checked: true },
    { id: 3, name: "Lachsfilet", amount: "300g", checked: false },
    { id: 4, name: "Pesto Verde", amount: "1 Glas", checked: false },
  ]);

  const toggleItem = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="pt-8 px-1 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Einkauf</h1>
        <div className="bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {items.filter(i => !i.checked).length} offen
        </div>
      </header>

      {/* Add Item Quick Input */}
      <div className="px-1 flex gap-2">
        <input 
          type="text" 
          placeholder="Artikel hinzufügen..." 
          className="flex-1 bg-[var(--card)] border border-[var(--border)]/10 rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none shadow-sm"
        />
        <button className="w-14 h-14 rounded-2xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center shadow-lg ios-active-scale">
          <Plus size={24} />
        </button>
      </div>

      {/* Shopping List Items */}
      <div className="space-y-4 px-1 pb-10">
        {items.length > 0 ? (
          <div className="bg-[var(--card)] rounded-[24px] overflow-hidden border border-[var(--border)]/10">
            {items.sort((a, b) => Number(a.checked) - Number(b.checked)).map((item, i) => (
              <div 
                key={item.id} 
                className={`flex items-center gap-4 p-5 group transition-all duration-300 ${
                  i !== 0 ? "border-t border-[var(--border)]/20" : ""
                } ${item.checked ? "opacity-50" : "opacity-100"}`}
              >
                <button 
                  onClick={() => toggleItem(item.id)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    item.checked 
                    ? "bg-green-500 border-green-500 text-white" 
                    : "border-[var(--border)] bg-transparent"
                  }`}
                >
                  {item.checked && <Check size={16} strokeWidth={3} />}
                </button>
                
                <div className="flex-1">
                  <p className={`font-bold text-[17px] ${item.checked ? "line-through" : ""}`}>
                    {item.name}
                  </p>
                  <p className="text-[12px] text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
                    {item.amount}
                  </p>
                </div>

                <button 
                  onClick={() => removeItem(item.id)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity active:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] mx-auto">
              <ShoppingBag size={32} />
            </div>
            <p className="text-[var(--muted-foreground)] font-medium">Deine Einkaufsliste ist leer.</p>
          </div>
        )}
      </div>
    </div>
  );
}
