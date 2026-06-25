import { useNavigate } from 'react-router';
import { useRecipes } from '../context/RecipeContext';
import { Settings, Heart, BookOpen, Clock } from 'lucide-react';

export function Profile() {
  const navigate = useNavigate();
  const { recipes } = useRecipes();

  const myRecipes = recipes.filter(r => r.author === 'Ich');
  const favoriteRecipes = recipes.filter(r => r.isLiked);
  const totalLikes = myRecipes.reduce((sum, r) => sum + r.likes, 0);

  return (
    <div className="pb-10" style={{ fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Profile hero */}
      <div className="px-5 pt-4 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format"
              alt="Profilbild"
              className="w-20 h-20 rounded-2xl object-cover bg-muted"
            />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-xs text-primary-foreground font-bold">✓</span>
            </span>
          </div>
          <div className="flex-1">
            <h2
              className="text-xl font-bold text-foreground mb-0.5"
              style={{ fontFamily: 'var(--font-display, system-ui)' }}
            >
              Ich
            </h2>
            <p className="text-sm text-muted-foreground">Hobbykoch und Rezeptliebhaber</p>
          </div>
          <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: myRecipes.length, label: 'Rezepte' },
            { value: totalLikes, label: 'Likes' },
            { value: favoriteRecipes.length, label: 'Favoriten' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-card rounded-2xl p-4 text-center border border-border shadow-sm shadow-black/5">
              <div className="text-2xl font-bold text-foreground leading-none mb-0.5">{value}</div>
              <div className="text-xs text-muted-foreground font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* My Recipes */}
      <div className="px-5 mb-6">
        <h3
          className="text-lg font-bold text-foreground mb-3 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display, system-ui)' }}
        >
          <BookOpen className="h-5 w-5 text-primary" />
          Meine Rezepte
        </h3>
        {myRecipes.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <p className="text-muted-foreground text-sm mb-4">Du hast noch keine Rezepte erstellt</p>
            <button
              onClick={() => navigate('/add-recipe')}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold"
              style={{ boxShadow: '0 4px 16px rgba(16,185,129,0.30)' }}
            >
              Erstes Rezept erstellen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {myRecipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => navigate(`/recipes/${recipe.id}`)}
                className="w-full text-left bg-card rounded-2xl overflow-hidden border border-border shadow-sm shadow-black/5 hover:shadow-md active:scale-[0.98] transition-all"
              >
                <div className="w-full h-32 bg-muted">
                  <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-foreground text-sm line-clamp-1 mb-1">{recipe.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{recipe.likes}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{recipe.prepTime + recipe.cookTime}m</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-border mb-6" />

      {/* Favorites */}
      <div className="px-5">
        <h3
          className="text-lg font-bold text-foreground mb-3 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display, system-ui)' }}
        >
          <Heart className="h-5 w-5 text-rose-500" />
          Favoriten
        </h3>
        {favoriteRecipes.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <p className="text-muted-foreground text-sm">Du hast noch keine Favoriten</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {favoriteRecipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => navigate(`/recipes/${recipe.id}`)}
                className="w-full text-left flex gap-3 bg-card rounded-2xl overflow-hidden border border-border shadow-sm shadow-black/5 hover:shadow-md active:scale-[0.98] transition-all"
              >
                <div className="w-24 h-24 shrink-0 bg-muted">
                  <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 py-3 pr-3 min-w-0">
                  <p className="font-semibold text-foreground text-sm mb-1 truncate">{recipe.title}</p>
                  <p className="text-xs text-muted-foreground mb-2">von {recipe.author}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {recipe.prepTime + recipe.cookTime} Min
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
