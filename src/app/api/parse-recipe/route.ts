import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'API is reachable' });
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const schema: Schema = {
      type: Type.ARRAY,
      description: "List of parsed ingredients",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the ingredient (e.g., Banane, Haferflocken, Honig)" },
          amount: { type: Type.NUMBER, description: "Amount (number only, e.g. 2, 100, 1.5)" },
          unit: { type: Type.STRING, description: "Unit (e.g., Stk, g, ml, EL, TL, Priese). Use 'g' as default if unknown." },
          calories: { type: Type.NUMBER, description: "Estimated total calories (kcal) for this specific amount of the ingredient" },
          protein: { type: Type.NUMBER, description: "Estimated total protein in grams for this specific amount" },
          carbs: { type: Type.NUMBER, description: "Estimated total carbs in grams for this specific amount" },
          fat: { type: Type.NUMBER, description: "Estimated total fat in grams for this specific amount" },
        },
        required: ["name", "amount", "unit", "calories", "protein", "carbs", "fat"],
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Parse the following raw ingredient text into a structured list.
Text: "${text}"

For each ingredient, calculate the estimated macros (calories, protein, carbs, fat) BASED ON THE AMOUNT PROVIDED.
Example: If the text says "100g Haferflocken", calculate macros for 100g. If it says "2 Bananen", calculate macros for 2 medium bananas.
Respond ONLY with the JSON array matching the schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(response.text);
    return NextResponse.json({ ingredients: result });

  } catch (error: any) {
    console.error("AI Parse Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to parse recipe' }, { status: 500 });
  }
}
