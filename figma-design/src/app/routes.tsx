import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { Recipes } from "./components/Recipes";
import { RecipeDetail } from "./components/RecipeDetail";
import { AddRecipe } from "./components/AddRecipe";
import { ShoppingList } from "./components/ShoppingList";
import { Profile } from "./components/Profile";
import { Social } from "./components/Social";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "recipes", Component: Recipes },
      { path: "recipes/:id", Component: RecipeDetail },
      { path: "add-recipe", Component: AddRecipe },
      { path: "shopping", Component: ShoppingList },
      { path: "social", Component: Social },
      { path: "profile", Component: Profile },
    ],
  },
]);
