import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRecipes } from '../context/RecipeContext';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';

export function AddRecipe() {
  const navigate = useNavigate();
  const { addRecipe } = useRecipes();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category) {
      toast.error('Bitte alle Pflichtfelder ausfüllen');
      return;
    }

    const filteredIngredients = ingredients.filter(i => i.trim());
    const filteredInstructions = instructions.filter(i => i.trim());

    if (filteredIngredients.length === 0 || filteredInstructions.length === 0) {
      toast.error('Bitte mindestens eine Zutat und einen Schritt hinzufügen');
      return;
    }

    addRecipe({
      title,
      description,
      image: image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800',
      prepTime: parseInt(prepTime) || 0,
      cookTime: parseInt(cookTime) || 0,
      servings: parseInt(servings) || 4,
      difficulty,
      category,
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
      author: 'Ich',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    });

    toast.success('Rezept erfolgreich erstellt!');
    navigate('/recipes');
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-neutral-950 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-900 dark:text-white" />
        </button>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Neues Rezept</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {/* Basic Info */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-4 space-y-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Spaghetti Carbonara"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Beschreibung *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kurze Beschreibung des Rezepts"
                required
              />
            </div>

            <div>
              <Label htmlFor="image">Bild URL</Label>
              <Input
                id="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="category">Kategorie *</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="z.B. Pasta, Asiatisch, Dessert"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prepTime">Vorbereitung (Min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  placeholder="30"
                />
              </div>
              <div>
                <Label htmlFor="cookTime">Kochzeit (Min)</Label>
                <Input
                  id="cookTime"
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  placeholder="20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="servings">Portionen</Label>
                <Input
                  id="servings"
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  placeholder="4"
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Schwierigkeit</Label>
                <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Einfach</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="hard">Schwer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label>Zutaten</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddIngredient}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Hinzufügen
              </Button>
            </div>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  placeholder="z.B. 200g Mehl"
                />
                {ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveIngredient(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label>Zubereitung</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddInstruction}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Hinzufügen
              </Button>
            </div>
            {instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-medium mt-2">
                  {index + 1}
                </div>
                <Textarea
                  value={instruction}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  placeholder="Beschreibe diesen Schritt..."
                  rows={2}
                />
                {instructions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveInstruction(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit */}
        <Button type="submit" className="w-full">
          Rezept erstellen
        </Button>
      </form>
    </div>
  );
}
