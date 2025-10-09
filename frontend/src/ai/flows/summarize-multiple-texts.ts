// Summarize multiple texts into a consolidated summary.

'use server';

import {ai} from '../genkit';
import { z } from 'zod';

const SummarizeMultipleTextsInputSchema = z.object({
  texts: z.array(z.string()).describe('An array of text snippets to summarize.'),
});
export type SummarizeMultipleTextsInput = z.infer<typeof SummarizeMultipleTextsInputSchema>;

const SummarizeMultipleTextsOutputSchema = z.object({
  summary: z.string().describe('The consolidated summary of the input texts.'),
});
export type SummarizeMultipleTextsOutput = z.infer<typeof SummarizeMultipleTextsOutputSchema>;

export async function summarizeMultipleTexts(input: SummarizeMultipleTextsInput): Promise<SummarizeMultipleTextsOutput> {
  return summarizeMultipleTextsFlow(input);
}

const summarizeMultipleTextsPrompt = ai.definePrompt({
  name: 'summarizeMultipleTextsPrompt',
  input: {schema: SummarizeMultipleTextsInputSchema},
  output: {schema: SummarizeMultipleTextsOutputSchema},
  prompt: `Eres un experto resumiendo reseñas. Basado en las siguientes reseñas, escribe un resumen breve a modo de recomendación en español.

{{#each texts}}
Reseña {{@index}}: {{{this}}}
{{/each}}`,
});

const summarizeMultipleTextsFlow = ai.defineFlow(
  {
    name: 'summarizeMultipleTextsFlow',
    inputSchema: SummarizeMultipleTextsInputSchema,
    outputSchema: SummarizeMultipleTextsOutputSchema,
  },
  async input => {
    const {output} = await summarizeMultipleTextsPrompt(input);
    return output!;
  }
);

const generateAttendanceInsightPrompt = ai.definePrompt({
  name: 'generateAttendanceInsightPrompt',
  input: {schema: SummarizeMultipleTextsInputSchema},
  output: {schema: SummarizeMultipleTextsOutputSchema},
  prompt: `Eres un psicólogo experto en orientación universitaria. Analiza los siguientes aprendizajes obtenidos por el estudiante en sus citas y genera un insight profesional, incluyendo un plan de acción concreto para la siguiente sesión. El resultado debe estar en español y ser útil para el psicólogo.

{{#each texts}}
Aprendizaje {{@index}}: {{{this}}}
{{/each}}

Insight y plan de acción:`,
});

const generateAttendanceInsightFlow = ai.defineFlow(
  {
    name: 'generateAttendanceInsightFlow',
    inputSchema: SummarizeMultipleTextsInputSchema,
    outputSchema: SummarizeMultipleTextsOutputSchema,
  },
  async input => {
    const {output} = await generateAttendanceInsightPrompt(input);
    return output!;
  }
);

export async function generateAttendanceInsight(input: SummarizeMultipleTextsInput): Promise<SummarizeMultipleTextsOutput> {
  return generateAttendanceInsightFlow(input);
}
