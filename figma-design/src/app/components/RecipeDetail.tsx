import { useParams, useNavigate } from 'react-router';
import { useRecipes } from '../context/RecipeContext';
import { ArrowLeft, Clock, Users, ChefHat, Heart, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recipes, toggleLike, addToShoppingList } = useRecipes();

  const recipe = recipes.find(r => r.id === id);

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <p className="text-neutral-500 dark:text-neutral-400 mb-4">Rezept nicht gefunden</p>
        <Button onClick={() => navigate('/recipes')}>Zurück zu Rezepten</Button>
      </div>
    );
  }

  const handleAddToShoppingList = () => {
    addToShoppingList(recipe.ingredients, recipe.id);
    toast.success('Zutaten zur Einkaufsliste hinzugefügt!');
  };

  return (
    <div className="pb-6">
      {/* Header Image */}
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-64 object-cover"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 dark:bg-neutral-900/90 flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-900 dark:text-white" />
        </button>
        <button
          onClick={() => toggleLike(recipe.id)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 dark:bg-neutral-900/90 flex items-center justify-center shadow-lg"
        >
          <Heart
            className={`h-5 w-5 ${
              recipe.isLiked
                ? 'fill-rose-500 text-rose-500'
                : 'text-neutral-900 dark:text-white'
            }`}
          />
        </button>
      </div>

      {/* Recipe Info */}
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">{recipe.title}</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-4">{recipe.description}</p>

        {/* Author */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src={recipe.authorAvatar}
            alt={recipe.author}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-neutral-900 dark:text-white">{recipe.author}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {new Date(recipe.createdAt).toLocaleDateString('de-DE')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-3 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
              <div className="text-xs font-medium text-neutral-900 dark:text-white">{recipe.prepTime}m</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Vorb.</div>
            </CardContent>
          </Card>
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-3 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
              <div className="text-xs font-medium text-neutral-900 dark:text-white">{recipe.cookTime}m</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Koch.</div>
            </CardContent>
          </Card>
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-3 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
              <div className="text-xs font-medium text-neutral-900 dark:text-white">{recipe.servings}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Port.</div>
            </CardContent>
          </Card>
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-3 text-center">
              <ChefHat className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
              <div className="text-xs font-medium text-neutral-900 dark:text-white">
                {recipe.difficulty === 'easy' ? 'Leicht' : recipe.difficulty === 'medium' ? 'Mittel' : 'Schwer'}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Level</div>
            </CardContent>
          </Card>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Zutaten</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToShoppingList}
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Zur Liste
            </Button>
          </div>
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-4">
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-neutral-900 dark:text-white">Zubereitung</h2>
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-4">
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300 pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
