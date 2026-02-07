'use server';
/**
 * @fileOverview An AI agent for simplifying complex government documents into plain language.
 *
 * - simplifyDocument - A function that handles the document simplification process.
 * - SimplifyDocumentInput - The input type for the simplifyDocument function.
 * - SimplifyDocumentOutput - The return type for the simplifyDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplifyDocumentInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      'The content of the PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected description
    ),
  language: z.enum(['en', 'hi']).default('en').describe('The language to use for the simplification.'),
});
export type SimplifyDocumentInput = z.infer<typeof SimplifyDocumentInputSchema>;

const SimplifyDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the document.'),
  whatItMeans: z.string().describe('An explanation of what the document means for the user.'),
  actions: z
    .array(
      z.object({
        step: z.string().describe('A specific action the user needs to take.'),
        deadline: z.string().optional().describe('The deadline for the action, if applicable.'),
      })
    )
    .describe('A list of actions the user needs to take.'),
  consequences: z.string().describe('The consequences of not taking the required actions.'),
  helplines: z.array(z.string()).describe('A list of relevant helpline numbers or contact information.'),
  disclaimer: z.string().describe('A disclaimer that this is not official legal advice.'),
});
export type SimplifyDocumentOutput = z.infer<typeof SimplifyDocumentOutputSchema>;

export async function simplifyDocument(input: SimplifyDocumentInput): Promise<SimplifyDocumentOutput> {
  return simplifyDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simplifyDocumentPrompt',
  input: {schema: SimplifyDocumentInputSchema},
  output: {schema: SimplifyDocumentOutputSchema},
  prompt: `You are \"Bureaucracy Buster\" – a friendly, empathetic AI assistant for Indian citizens. Convert complex government documents into simple Hindi/English guidance. Use plain language, short sentences, emojis, bullet points. Structure first response as:
- Summary
- What this means for you
- Action steps (with deadlines)
- Consequences if you ignore
- Helplines / next steps
Always add disclaimer: \"This is not official legal advice.\"
If user asks for Hindi, respond entirely in natural Hindi.

Simplify the following document:

{{media url=fileDataUri}}`,
});

const simplifyDocumentFlow = ai.defineFlow(
  {
    name: 'simplifyDocumentFlow',
    inputSchema: SimplifyDocumentInputSchema,
    outputSchema: SimplifyDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output!,
      disclaimer: 'This is not official legal advice.',
    };
  }
);
