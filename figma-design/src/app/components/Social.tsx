import { useNavigate } from 'react-router';
import { useRecipes } from '../context/RecipeContext';
import { Heart, MessageCircle, Share2, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function Social() {
  const navigate = useNavigate();
  const { recipes, toggleLike } = useRecipes();

  // Sort by date, most recent first
  const sortedRecipes = [...recipes].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Vor wenigen Minuten';
    } else if (diffInHours < 24) {
      return `Vor ${Math.floor(diffInHours)} Stunden`;
    } else if (diffInHours < 48) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-2xl font-bold mb-1 text-neutral-900 dark:text-white">Social Feed</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Entdecke neue Rezepte von der Community
        </p>
      </div>

      {/* Feed */}
      <div className="space-y-4 px-6 py-4">
        {sortedRecipes.map((recipe) => (
          <Card key={recipe.id} className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-4">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={recipe.authorAvatar}
                  alt={recipe.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900 dark:text-white">{recipe.author}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDate(recipe.createdAt)}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                <p className="text-neutral-900 dark:text-white mb-2">
                  hat ein neues Rezept geteilt: <span className="font-semibold">{recipe.title}</span>
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  {recipe.description}
                </p>
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-64 object-cover rounded-lg mb-3"
                />
                <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {recipe.prepTime + recipe.cookTime} Min
                  </span>
                  <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs">
                    {recipe.category}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => toggleLike(recipe.id)}
                  className="flex items-center gap-2 text-sm hover:text-rose-500 transition-colors"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      recipe.isLiked
                        ? 'fill-rose-500 text-rose-500'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  />
                  <span className={recipe.isLiked ? 'text-rose-500' : 'text-neutral-600 dark:text-neutral-400'}>
                    {recipe.likes}
                  </span>
                </button>
                <button className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-emerald-500 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-neutral-600 dark:text-neutral-400">Kommentieren</span>
                </button>
                <button className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-emerald-500 transition-colors ml-auto">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
