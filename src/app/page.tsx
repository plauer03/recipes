import { Sparkles, ChefHat, Flame, ShoppingBag, ChevronRight } from "lucide-react";

export default async function Dashboard() {
  return (
    <div className="space-y-8 fade-in h-full overflow-hidden flex flex-col">
      <header className="pt-6 shrink-0">
        <h1 className="text-4xl font-extrabold tracking-tight">Guten Appetit!</h1>
        <p className="text-[var(--muted-foreground)] font-medium">Was kochen wir heute?</p>
      </header>

      <section className="bg-[var(--primary)] text-white p-6 rounded-[28px] shadow-lg ios-active-scale cursor-pointer shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles size={20} className="fill-white" />
              Inspiration finden
            </h2>
            <p className="text-white/80 text-sm font-medium">Basierend auf deinen Vorlieben</p>
          </div>
          <ChevronRight size={24} className="opacity-50" />
        </div>
      </section>

      <div className="flex gap-4 shrink-0">
        <div className="flex-1 bg-[var(--card)] p-4 rounded-[22px] flex items-center gap-3 border border-[var(--border)]/5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Status</p>
            <p className="text-lg font-bold">Aktiv</p>
          </div>
        </div>
        <div className="flex-1 bg-[var(--card)] p-4 rounded-[22px] flex items-center gap-3 border border-[var(--border)]/5 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Einkauf</p>
            <p className="text-lg font-bold">Bereit</p>
          </div>
        </div>
      </div>

      <section className="space-y-4 flex-1 overflow-hidden flex flex-col min-h-0 pb-4">
        <h2 className="text-xl font-bold tracking-tight px-1 shrink-0">Favoriten</h2>
        <div className="bg-[var(--card)] rounded-[24px] border border-[var(--border)]/10 shadow-sm overflow-y-auto no-scrollbar flex-1">
          <div className="p-8 text-center text-[var(--muted-foreground)]">
            <ChefHat size={40} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm font-medium">Noch keine Favoriten markiert</p>
          </div>
        </div>
      </section>
    </div>
  );
}
