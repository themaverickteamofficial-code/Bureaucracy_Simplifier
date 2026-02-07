'use server';

/**
 * @fileOverview Implements the conversational chat flow for the application.
 *
 * - chatWithDocument -  Handles the conversation with the AI, processing user messages and generating responses based on the document context.
 * - ChatInputType - The input type for the chatWithDocument function, including the message and document ID.
 * - ChatOutputType - The return type for the chatWithDocument function, providing the AI's response.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The content of the PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  message: z.string().describe('The user message.'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    data: z.any().optional(),
  })).describe('The conversation history.'),
});

export type ChatInputType = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI response to the user message.'),
});

export type ChatOutputType = z.infer<typeof ChatOutputSchema>;

export async function chatWithDocument(input: ChatInputType): Promise<ChatOutputType> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {
    schema: ChatInputSchema,
  },
  output: {schema: ChatOutputSchema},
  prompt: `You are "Bureaucracy Buster" – a friendly, empathetic and extremely advanced AI assistant for Indian citizens. Your role is to answer questions about the provided government document. Use the document as the primary source of truth.

    Document:
    {{media url=fileDataUri}}

    Conversation History:
    {{#each history}}
    {{this.role}}: {{{this.content}}}
    {{/each}}

    User's current message: {{{message}}}

    Based on the document and the conversation history, provide a clear and simple answer.
    Respond in the same language as the user's previous messages. Always add disclaimer: \"This is not official legal advice.\"`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
