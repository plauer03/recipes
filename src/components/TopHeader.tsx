"use client";

import { usePathname } from "next/navigation";

export function TopHeader() {
  const pathname = usePathname();

  // Hide on detail pages that have their own custom headers
  if (
    pathname?.startsWith("/recipes/") || 
    pathname?.startsWith("/edit-recipe/") || 
    pathname === "/add-recipe"
  ) {
    return null;
  }

  let title = "RecipeHub";
  if (pathname === "/shopping-list") title = "Einkaufsliste";
  else if (pathname === "/profile") title = "Einstellungen";
  else if (pathname === "/recipes") title = "Rezepte";

  return (
    <header 
      className="shrink-0 flex items-end justify-between px-5 pb-3 bg-background/90 backdrop-blur-xl border-b border-border w-full z-20"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
    >
      <span
        className="text-xl font-bold tracking-tight text-foreground"
        style={{ fontFamily: 'var(--font-display, system-ui)' }}
      >
        {title}
      </span>
    </header>
  );
}
