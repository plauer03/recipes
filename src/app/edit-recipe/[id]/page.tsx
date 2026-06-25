"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Loader2, Save, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';

const AVAILABLE_TAGS = [
  "Frühstück", "Hauptspeise", "Beilage", "Snack", "Dessert", 
  "Schnell", "Meal Prep", "Vegan", "Vegetarisch", "High Protein", "Low Carb"
];

export default function EditRecipe({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const resolvedParams = use(params);
  const recipeId = resolvedParams.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState('15');
  const [cookTime, setCookTime] = useState('20');
  const [difficulty, setDifficulty] = useState('easy');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  
  const [rawText, setRawText] = useState('');
  const [parsedIngredients, setParsedIngredients] = useState<any[]>([]);
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  async function fetchRecipe() {
    setInitialLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (data && !error) {
      setTitle(data.title || '');
      setDescription(data.description || '');
      setSelectedTags(data.tags || []);
      setPrepTime((data.prep_time || 0).toString());
      setCookTime((data.cook_time || 0).toString());
      setDifficulty(data.difficulty || 'easy');
      setRawText(data.instructions || '');
      setParsedIngredients(data.ingredients_data || []);
      
      if (data.image_url) {
        setImagePreview(data.image_url);
        setOriginalImageUrl(data.image_url);
      }
    } else {
      setErrorMsg("Rezept konnte nicht geladen werden.");
    }
    setInitialLoading(false);
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/parse-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler beim Berechnen");
      
      setParsedIngredients(data.ingredients);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title) {
      setErrorMsg("Bitte einen Titel eingeben.");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht eingeloggt");

      let finalImageUrl = originalImageUrl;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(`${user.id}/${fileName}`, imageFile);
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(`${user.id}/${fileName}`);
          
        finalImageUrl = publicUrlData.publicUrl;
      } else if (!imagePreview) {
        finalImageUrl = null;
      }

      const { error } = await supabase.from('recipes').update({
        title,
        description,
        tags: selectedTags,
        instructions: rawText,
        ingredients_data: parsedIngredients,
        prep_time: parseInt(prepTime) || 0,
        cook_time: parseInt(cookTime) || 0,
        difficulty,
        image_url: finalImageUrl
      }).eq('id', recipeId);

      if (error) throw error;
      router.push(`/recipes/${recipeId}`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="pb-10 h-full flex flex-col bg-background" style={{ fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Header */}
      <div 
        className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl px-5 pb-3 border-b border-border flex items-end gap-3"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
      >
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-secondary text-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground pb-1.5" style={{ fontFamily: 'var(--font-display, system-ui)' }}>Rezept bearbeiten</h1>
      </div>

      <div className="px-5 py-6 space-y-6 flex-1 overflow-y-auto no-scrollbar">
        {errorMsg && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Image Upload */}
        <div className="w-full h-48 rounded-2xl bg-secondary border-2 border-dashed border-border flex items-center justify-center relative overflow-hidden">
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => { setImagePreview(null); setImageFile(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-muted-foreground">
              <ImagePlus className="h-8 w-8 mb-2" />
              <span className="text-sm font-semibold">Titelbild ändern</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        {/* Basic Info */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground font-semibold">Titel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Protein Pancakes"
                className="bg-secondary border-none h-12 rounded-xl px-4 text-[15px]"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-foreground font-semibold">Kategorien (Mehrfachauswahl)</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedTags.includes(tag) 
                        ? 'bg-foreground text-background shadow-md' 
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground font-semibold">Vorbereitung (Min)</Label>
                <Input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="bg-secondary border-none h-12 rounded-xl px-4 text-[15px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-semibold">Kochzeit (Min)</Label>
                <Input
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  className="bg-secondary border-none h-12 rounded-xl px-4 text-[15px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-semibold">Schwierigkeit</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="bg-secondary border-none h-12 rounded-xl px-4 text-[15px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Einfach</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="hard">Schwer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-semibold">Beschreibung (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kurze Beschreibung..."
                className="bg-secondary border-none rounded-xl p-4 min-h-[80px] text-[15px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Input */}
        <Card className="border-border shadow-sm bg-card">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-foreground" />
              <Label className="text-foreground font-semibold text-lg">Zutaten & Zubereitung</Label>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-2">
              Ändere den Text und scanne neu, falls du Zutaten verändern möchtest.
            </p>
            
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="bg-secondary border-none rounded-xl p-4 min-h-[120px] text-[15px]"
            />
            
            <Button 
              onClick={handleParse} 
              disabled={loading || !rawText.trim()}
              className="w-full h-12 rounded-xl text-[15px] font-bold shadow-md bg-foreground text-background"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Zutaten & Makros neu scannen"}
            </Button>
          </CardContent>
        </Card>

        {/* AI Results */}
        {parsedIngredients.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg px-1">Aktuelle Zutaten</h3>
            <div className="bg-card rounded-2xl border border-border shadow-sm p-2 space-y-2">
              {parsedIngredients.map((ing, i) => (
                <div key={i} className="flex flex-col p-3 rounded-xl bg-secondary/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-foreground">{ing.amount} {ing.unit} {ing.name}</span>
                    <span className="font-black text-foreground text-sm">{ing.calories} kcal</span>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span>P: <span className="text-foreground">{ing.protein}g</span></span>
                    <span>C: <span className="text-foreground">{ing.carbs}g</span></span>
                    <span>F: <span className="text-foreground">{ing.fat}g</span></span>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full h-14 rounded-2xl text-[16px] font-bold bg-foreground text-background mt-4 shadow-lg"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="mr-2 h-5 w-5" /> Änderungen speichern</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
