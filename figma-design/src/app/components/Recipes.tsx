import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRecipes } from '../context/RecipeContext';
import { Clock, ChefHat, Heart, Search, X } from 'lucide-react';

export function Recipes() {
  const navigate = useNavigate();
  const { recipes, toggleLike } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Alle' },
    { id: 'Pasta', label: 'Pasta' },
    { id: 'Asiatisch', label: 'Asiatisch' },
    { id: 'Frühstück', label: 'Frühstück' },
    { id: 'Dessert', label: 'Dessert' },
  ];

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || recipe.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-10" style={{ fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Sticky search */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl px-5 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Rezepte suchen…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-10 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
            style={activeCategory === cat.id ? { boxShadow: '0 2px 10px rgba(16,185,129,0.30)' } : {}}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Recipe list */}
      <div className="px-5 flex flex-col gap-3">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">Keine Rezepte gefunden</p>
          </div>
        ) : (
          filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm shadow-black/5 hover:shadow-md active:scale-[0.99] transition-all"
            >
              <button className="w-full text-left" onClick={() => navigate(`/recipes/${recipe.id}`)}>
                <div className="relative w-full h-48 bg-muted">
                  <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      {recipe.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3
                    className="font-bold text-lg text-foreground mb-1 leading-snug"
                    style={{ fontFamily: 'var(--font-display, system-ui)' }}
                  >
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{recipe.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {recipe.prepTime + recipe.cookTime} Min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ChefHat className="h-3.5 w-3.5" />
                        {recipe.difficulty === 'easy' ? 'Einfach' : recipe.difficulty === 'medium' ? 'Mittel' : 'Schwer'}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLike(recipe.id); }}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-2.5 py-1 rounded-full ${
                        recipe.isLiked
                          ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30'
                          : 'text-muted-foreground bg-secondary'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${recipe.isLiked ? 'fill-current' : ''}`} />
                      {recipe.likes}
                    </button>
                  </div>
                </div>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
