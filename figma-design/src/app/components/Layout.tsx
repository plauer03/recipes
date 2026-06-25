import { Outlet, useLocation, useNavigate } from 'react-router';
import { Home, BookOpen, ShoppingCart, Users, User, Plus, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'Rezepte', path: '/recipes' },
    { icon: ShoppingCart, label: 'Einkauf', path: '/shopping' },
    { icon: Users, label: 'Social', path: '/social' },
    { icon: User, label: 'Profil', path: '/profile' },
  ];

  const showFab = location.pathname === '/recipes' || location.pathname === '/';

  return (
    <div
      className="h-screen flex flex-col bg-background"
      style={{ fontFamily: 'var(--font-sans, system-ui)' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-3 bg-background/80 backdrop-blur-xl z-20 sticky top-0 border-b border-border">
        <span
          className="text-xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-display, system-ui)' }}
        >
          RecipeHub
        </span>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Theme wechseln"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto" style={{ scrollbarWidth: 'none' }}>
        <Outlet />
      </main>

      {/* FAB */}
      {showFab && (
        <button
          onClick={() => navigate('/add-recipe')}
          className="fixed bottom-[88px] right-5 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-10"
          style={{ boxShadow: '0 8px 24px rgba(16,185,129,0.35)' }}
          aria-label="Neues Rezept"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="border-t border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center justify-around px-1 pt-2 pb-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative flex items-center justify-center w-7 h-7">
                  <Icon className={`h-[22px] w-[22px] transition-all ${isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
                  {isActive && (
                    <span className="absolute inset-0 rounded-lg bg-primary/10" />
                  )}
                </div>
                <span className={`text-[10px] font-medium tracking-wide transition-all ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
