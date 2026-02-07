'use server';

/**
 * @fileOverview Generates a structured summary of a document with key sections.
 *
 * - generateStructuredSummary - A function that generates the structured summary.
 * - GenerateStructuredSummaryInput - The input type for the generateStructuredSummary function.
 * - GenerateStructuredSummaryOutput - The return type for the generateStructuredSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateStructuredSummaryInputSchema = z.object({
  documentText: z.string().describe('The text content of the document to summarize.'),
});
export type GenerateStructuredSummaryInput = z.infer<typeof GenerateStructuredSummaryInputSchema>;

const GenerateStructuredSummaryOutputSchema = z.object({
  summary: z.string(),
  whatItMeans: z.string(),
  actions: z.array(z.object({ step: z.string(), deadline: z.string().optional() })),
  consequences: z.string(),
  helplines: z.array(z.string()),
});
export type GenerateStructuredSummaryOutput = z.infer<typeof GenerateStructuredSummaryOutputSchema>;

export async function generateStructuredSummary(input: GenerateStructuredSummaryInput): Promise<GenerateStructuredSummaryOutput> {
  return generateStructuredSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStructuredSummaryPrompt',
  input: {schema: GenerateStructuredSummaryInputSchema},
  output: {schema: GenerateStructuredSummaryOutputSchema},
  prompt: `You are \"Bureaucracy Buster\" – a friendly, empathetic AI assistant for Indian citizens. Convert complex government documents into simple Hindi/English guidance. Use plain language, short sentences, emojis, bullet points. Structure response as:
- Summary
- What this means for you
- Action steps (with deadlines)
- Consequences if you ignore
- Helplines / next steps
Always add disclaimer: \"This is not official legal advice.\"\n\nDocument to summarize: {{{documentText}}} `,
});

const generateStructuredSummaryFlow = ai.defineFlow(
  {
    name: 'generateStructuredSummaryFlow',
    inputSchema: GenerateStructuredSummaryInputSchema,
    outputSchema: GenerateStructuredSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
