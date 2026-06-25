import { useState } from 'react';
import { useRecipes } from '../context/RecipeContext';
import { Plus, Trash2, ShoppingBasket } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';

export function ShoppingList() {
  const { shoppingList, addToShoppingList, toggleShoppingItem, removeShoppingItem, clearShoppingList } = useRecipes();
  const [newItem, setNewItem] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      addToShoppingList([newItem.trim()]);
      setNewItem('');
    }
  };

  const uncheckedItems = shoppingList.filter(item => !item.checked);
  const checkedItems = shoppingList.filter(item => item.checked);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-2xl font-bold mb-1 text-neutral-900 dark:text-white">Einkaufsliste</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {uncheckedItems.length} {uncheckedItems.length === 1 ? 'Artikel' : 'Artikel'}
        </p>
      </div>

      {/* Add Item Form */}
      <div className="px-6 py-4">
        <form onSubmit={handleAddItem} className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Artikel hinzufügen..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </form>
      </div>

      {/* Shopping List */}
      <div className="px-6 space-y-4">
        {shoppingList.length === 0 ? (
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-12 text-center">
              <ShoppingBasket className="h-12 w-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
              <p className="text-neutral-500 dark:text-neutral-400">Deine Einkaufsliste ist leer</p>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                Füge Artikel hinzu oder importiere sie aus Rezepten
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Unchecked Items */}
            {uncheckedItems.length > 0 && (
              <Card className="border-neutral-200 dark:border-neutral-800">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {uncheckedItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 group">
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={() => toggleShoppingItem(item.id)}
                        />
                        <label
                          htmlFor={item.id}
                          className="flex-1 cursor-pointer text-neutral-900 dark:text-white"
                        >
                          {item.name}
                        </label>
                        <button
                          onClick={() => removeShoppingItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-neutral-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Checked Items */}
            {checkedItems.length > 0 && (
              <Card className="border-neutral-200 dark:border-neutral-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Erledigt ({checkedItems.length})
                    </p>
                  </div>
                  <div className="space-y-3">
                    {checkedItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 group">
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={() => toggleShoppingItem(item.id)}
                        />
                        <label
                          htmlFor={item.id}
                          className="flex-1 cursor-pointer line-through text-neutral-400 dark:text-neutral-600"
                        >
                          {item.name}
                        </label>
                        <button
                          onClick={() => removeShoppingItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-neutral-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clear All Button */}
            <Button
              variant="outline"
              onClick={clearShoppingList}
              className="w-full"
            >
              Liste leeren
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
