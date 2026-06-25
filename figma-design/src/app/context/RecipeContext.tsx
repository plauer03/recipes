import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: string[];
  instructions: string[];
  category: string;
  author: string;
  authorAvatar: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  recipeId?: string;
}

interface RecipeContextType {
  recipes: Recipe[];
  shoppingList: ShoppingItem[];
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'likes' | 'isLiked'>) => void;
  toggleLike: (recipeId: string) => void;
  addToShoppingList: (items: string[], recipeId?: string) => void;
  toggleShoppingItem: (itemId: string) => void;
  removeShoppingItem: (itemId: string) => void;
  clearShoppingList: () => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

const initialRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Spaghetti Carbonara',
    description: 'Klassisches italienisches Pasta-Gericht mit cremiger Ei-Käse-Sauce',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800',
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: 'easy',
    ingredients: [
      '400g Spaghetti',
      '200g Guanciale oder Pancetta',
      '4 Eigelb',
      '100g Pecorino Romano',
      'Schwarzer Pfeffer',
      'Salz'
    ],
    instructions: [
      'Pasta in Salzwasser kochen',
      'Guanciale in einer Pfanne knusprig braten',
      'Eigelb mit geriebenem Käse vermischen',
      'Pasta abgießen, Wasser aufbewahren',
      'Pasta mit Guanciale vermischen',
      'Ei-Käse-Mischung unterrühren, ggf. Pastawasser hinzufügen',
      'Mit Pfeffer würzen und servieren'
    ],
    category: 'Pasta',
    author: 'Maria Rossi',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    likes: 127,
    isLiked: false,
    createdAt: '2026-06-20T10:00:00Z'
  },
  {
    id: '2',
    title: 'Thai Curry',
    description: 'Aromatisches rotes Thai-Curry mit Gemüse und Kokosmilch',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800',
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: 'medium',
    ingredients: [
      '2 EL rote Currypaste',
      '400ml Kokosmilch',
      '300g Gemüse (Paprika, Zucchini, Karotten)',
      '200g Tofu oder Hähnchen',
      '2 EL Fischsauce',
      '1 EL Zucker',
      'Thai-Basilikum',
      'Jasminreis'
    ],
    instructions: [
      'Currypaste in etwas Kokosmilch anbraten',
      'Restliche Kokosmilch hinzufügen',
      'Gemüse und Protein hinzufügen',
      'Mit Fischsauce und Zucker abschmecken',
      '15-20 Minuten köcheln lassen',
      'Mit Basilikum garnieren',
      'Mit Jasminreis servieren'
    ],
    category: 'Asiatisch',
    author: 'Somchai Wong',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    likes: 89,
    isLiked: true,
    createdAt: '2026-06-19T14:30:00Z'
  },
  {
    id: '3',
    title: 'Avocado Toast',
    description: 'Gesundes Frühstück mit cremiger Avocado auf knusprigem Toast',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800',
    prepTime: 5,
    cookTime: 5,
    servings: 2,
    difficulty: 'easy',
    ingredients: [
      '2 Scheiben Vollkornbrot',
      '1 reife Avocado',
      '1 EL Zitronensaft',
      'Chiliflocken',
      'Salz und Pfeffer',
      'Optional: Pochiertes Ei'
    ],
    instructions: [
      'Brot toasten',
      'Avocado zerdrücken und mit Zitronensaft, Salz und Pfeffer würzen',
      'Avocado-Mischung auf Toast verteilen',
      'Mit Chiliflocken bestreuen',
      'Optional mit pochiertem Ei toppen'
    ],
    category: 'Frühstück',
    author: 'Lisa Müller',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    likes: 203,
    isLiked: false,
    createdAt: '2026-06-22T08:15:00Z'
  },
  {
    id: '4',
    title: 'Schokoladen Brownies',
    description: 'Saftige, fudgy Schokoladenbrownies mit knuspriger Kruste',
    image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800',
    prepTime: 15,
    cookTime: 30,
    servings: 12,
    difficulty: 'easy',
    ingredients: [
      '200g Zartbitterschokolade',
      '150g Butter',
      '200g Zucker',
      '3 Eier',
      '100g Mehl',
      '30g Kakaopulver',
      '1 Prise Salz',
      'Optional: Walnüsse'
    ],
    instructions: [
      'Ofen auf 180°C vorheizen',
      'Schokolade und Butter schmelzen',
      'Zucker und Eier unterrühren',
      'Mehl, Kakao und Salz einrühren',
      'Optional Walnüsse unterheben',
      'In gefettete Form geben',
      '25-30 Minuten backen'
    ],
    category: 'Dessert',
    author: 'Emma Schmidt',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    likes: 156,
    isLiked: true,
    createdAt: '2026-06-21T16:45:00Z'
  }
];

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('recipes');
    return saved ? JSON.parse(saved) : initialRecipes;
  });

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('shoppingList');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  }, [shoppingList]);

  const addRecipe = (recipe: Omit<Recipe, 'id' | 'createdAt' | 'likes' | 'isLiked'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };
    setRecipes(prev => [newRecipe, ...prev]);
  };

  const toggleLike = (recipeId: string) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === recipeId 
        ? { ...recipe, isLiked: !recipe.isLiked, likes: recipe.isLiked ? recipe.likes - 1 : recipe.likes + 1 }
        : recipe
    ));
  };

  const addToShoppingList = (items: string[], recipeId?: string) => {
    const newItems = items.map(item => ({
      id: Date.now().toString() + Math.random(),
      name: item,
      checked: false,
      recipeId
    }));
    setShoppingList(prev => [...prev, ...newItems]);
  };

  const toggleShoppingItem = (itemId: string) => {
    setShoppingList(prev => prev.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeShoppingItem = (itemId: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== itemId));
  };

  const clearShoppingList = () => {
    setShoppingList([]);
  };

  return (
    <RecipeContext.Provider value={{
      recipes,
      shoppingList,
      addRecipe,
      toggleLike,
      addToShoppingList,
      toggleShoppingItem,
      removeShoppingItem,
      clearShoppingList
    }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
}
