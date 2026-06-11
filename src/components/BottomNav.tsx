"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, BookOpen, ShoppingBag, User } from "lucide-react";

const BottomNav = () => {
  const pathname = usePathname();

  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  if (isAuthPage) return null;

  const navItems = [
    { name: "Heute", href: "/", icon: Home },
    { name: "Suchen", href: "/search", icon: Search },
    { name: "Rezepte", href: "/recipes", icon: BookOpen },
    { name: "Einkauf", href: "/shopping-list", icon: ShoppingBag },
    { name: "Profil", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-[450px] h-[84px] glass border-t border-[var(--border)] flex justify-around items-start pt-2 px-2 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 gap-1 transition-colors active:opacity-50 ${
              isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
