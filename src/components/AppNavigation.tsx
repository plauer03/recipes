"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, ShoppingCart, Users, User, Plus, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

export function AppNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BookOpen, label: "Rezepte", path: "/recipes" },
    { icon: ShoppingCart, label: "Einkauf", path: "/shopping-list" },
    { icon: User, label: "Profil", path: "/profile" },
  ];

  const showFab = pathname === "/recipes" || pathname === "/";
  // We don't show navigation on auth pages
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) return null;

  return (
    <>
      {/* FAB */}
      {showFab && (
        <button
          onClick={() => router.push("/add-recipe")}
          className="absolute bottom-[88px] right-5 w-14 h-14 rounded-2xl bg-foreground text-background shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-10"
          style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
          aria-label="Neues Rezept"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full border-t border-border bg-card/80 backdrop-blur-xl z-20">
        <div className="flex items-center justify-around px-1 pt-2 pb-8">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                href={item.path}
                key={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 transition-all duration-150 ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative flex items-center justify-center w-7 h-7">
                  <Icon className={`h-[22px] w-[22px] transition-all ${isActive ? 'stroke-[2.5]' : 'stroke-[1.6]'}`} />
                </div>
                <span className={`text-[10px] font-medium tracking-wide transition-all ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
