"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ShoppingCart, User } from "lucide-react";

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Rezepte", href: "/recipes", icon: UtensilsCrossed },
    { name: "Liste", href: "/shopping-list", icon: ShoppingCart },
    { name: "Profil", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-[450px] h-[65px] bg-[var(--card)] border-t border-[var(--border)] flex justify-around items-center pb-2 z-20">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 gap-1 transition-colors ${
              isActive ? "text-[var(--primary)] font-bold" : "text-[var(--muted-foreground)]"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] uppercase tracking-wider">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
