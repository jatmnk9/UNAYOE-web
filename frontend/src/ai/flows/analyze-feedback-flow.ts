'use server';

import { z } from 'zod'; // Mantén Zod para la validación de tipos
import { promises as fs } from 'fs';
import path from 'path';

const AnalyzeFeedbackInputSchema = z.object({
  text: z.string().describe('The feedback text to analyze.'),
});
export type AnalyzeFeedbackInput = z.infer<typeof AnalyzeFeedbackInputSchema>;

const AnalyzeFeedbackOutputSchema = z.object({
  texto: z.string().describe('The original feedback text.'),
  sentimiento: z.enum(['Positivo', 'Negativo', 'Neutral']).describe('The sentiment of the text.'),
  resumen: z.string().describe('A short summary of the feedback text.'),
});
export type AnalyzeFeedbackOutput = z.infer<typeof AnalyzeFeedbackOutputSchema>;

// Esta es la única función que tu código frontend llama
export async function analyzeFeedback(input: AnalyzeFeedbackInput): Promise<AnalyzeFeedbackOutput> {
  // Aquí hacemos la llamada a tu API de Python
  const response = await fetch('http://127.0.0.1:8000/analizar_texto/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ texto: input.text }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error en la API de Python: ${response.status} - ${errorData.error || 'Mensaje de error desconocido'}`);
  }

  const data = await response.json();
  
  // Validamos que la respuesta de la API de Python coincida con el esquema esperado
  // para evitar errores de tipo en la aplicación.
  const parsedData = AnalyzeFeedbackOutputSchema.parse(data);

  return parsedData;
}