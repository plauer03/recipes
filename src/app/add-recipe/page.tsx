"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function AddRecipe() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [rawText, setRawText] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedIngredients, setParsedIngredients] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

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

      const { error } = await supabase.from('recipes').insert({
        title,
        description,
        tags: category ? [category] : [],
        instructions: rawText, // we just save the raw text as instructions for now
        ingredients_data: parsedIngredients,
        created_by: user.id
      });

      if (error) throw error;
      router.push('/recipes');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-10 h-full flex flex-col bg-background" style={{ fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl px-6 py-4 border-b border-border flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-secondary text-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Neues Rezept</h1>
      </div>

      <div className="px-5 py-6 space-y-6 flex-1 overflow-y-auto no-scrollbar">
        {errorMsg && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

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

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground font-semibold">Kategorie (Optional)</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="z.B. Frühstück"
                className="bg-secondary border-none h-12 rounded-xl px-4 text-[15px]"
              />
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
        <Card className="border-primary/20 shadow-sm bg-primary/5">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <Label className="text-foreground font-semibold text-lg">Zutaten (Smart Input)</Label>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-2">Schreibe einfach alles auf, was ins Rezept kommt. Die KI berechnet automatisch alle Kalorien und Makros.</p>
            
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="z.B. 2 Eier, 50g Haferflocken, 1 Banane, 30g Proteinpulver"
              className="bg-background border-border rounded-xl p-4 min-h-[120px] text-[15px] shadow-inner"
            />
            
            <Button 
              onClick={handleParse} 
              disabled={loading || !rawText.trim()}
              className="w-full h-12 rounded-xl text-[15px] font-bold shadow-lg"
              style={{ boxShadow: '0 4px 14px rgba(0,230,118,0.25)' }}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Makros & Nährwerte berechnen"}
            </Button>
          </CardContent>
        </Card>

        {/* AI Results */}
        {parsedIngredients.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-bold text-lg px-1">Erkannte Zutaten</h3>
            <div className="bg-card rounded-2xl border border-border shadow-sm p-2 space-y-2">
              {parsedIngredients.map((ing, i) => (
                <div key={i} className="flex flex-col p-3 rounded-xl bg-secondary/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-foreground">{ing.amount} {ing.unit} {ing.name}</span>
                    <span className="font-black text-primary text-sm">{ing.calories} kcal</span>
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
              className="w-full h-14 rounded-2xl text-[16px] font-bold bg-foreground text-background hover:bg-foreground/90 mt-4"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="mr-2 h-5 w-5" /> Rezept speichern</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
