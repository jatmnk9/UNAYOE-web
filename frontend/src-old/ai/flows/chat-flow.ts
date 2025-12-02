// src/ai/flows/chat-flow.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Esquemas de entrada y salida para el flujo de chat
const ChatInputSchema = z.object({
  context: z.string().describe('The consolidated summary of the feedback.'),
  query: z.string().describe('The user\'s question to the chatbot.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// Exporta la función que se llamará desde tu componente de React
export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

// Prompt para el flujo de conversación
const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `Eres un asistente de análisis de feedback para psicólogos. Responde a la pregunta del usuario basándote únicamente en el siguiente resumen de reseñas.

Resumen del feedback:
{{{context}}}

Pregunta del usuario:
{{{query}}}

Respuesta:`,
});

// El flujo principal de la IA
const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await chatPrompt(input);
    return output!;
  }
);