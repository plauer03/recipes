import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { RecipeProvider } from './context/RecipeContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <ThemeProvider>
      <RecipeProvider>
        <RouterProvider router={router} />
        <Toaster />
      </RecipeProvider>
    </ThemeProvider>
  );
}