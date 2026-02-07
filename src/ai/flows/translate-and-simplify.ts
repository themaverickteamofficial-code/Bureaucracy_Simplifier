'use server';

/**
 * @fileOverview Implements a Genkit flow that simplifies documents and translates the simplification
 * into a specified language, supporting multi-language functionality.
 *
 * - translateAndSimplifyDocument - A function that simplifies and translates a document.
 * - TranslateAndSimplifyInput - The input type for the translateAndSimplifyDocument function.
 * - TranslateAndSimplifyOutput - The return type for the translateAndSimplifyDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {simplifyDocument} from './simplify-document';
import {translateText} from './multi-language-support';

const TranslateAndSimplifyInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      'The content of the PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected description
    ),
  language: z.string().describe('The target language for simplification and chat responses (e.g., Hindi, English).').default('en'),
});
export type TranslateAndSimplifyInput = z.infer<typeof TranslateAndSimplifyInputSchema>;

const TranslateAndSimplifyOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the document in the target language.'),
  whatItMeans: z.string().describe('An explanation of what the document means for the user in the target language.'),
  actions: z
    .array(
      z.object({
        step: z.string().describe('A specific action the user needs to take in the target language.'),
        deadline: z.string().optional().describe('The deadline for the action, if applicable, in the target language.'),
      })
    )
    .describe('A list of actions the user needs to take in the target language.'),
  consequences: z.string().describe('The consequences of not taking the required actions in the target language.'),
  helplines: z.array(z.string()).describe('A list of relevant helpline numbers or contact information in the target language.'),
  disclaimer: z.string().describe('A disclaimer that this is not official legal advice in the target language.'),
});
export type TranslateAndSimplifyOutput = z.infer<typeof TranslateAndSimplifyOutputSchema>;

export async function translateAndSimplifyDocument(input: TranslateAndSimplifyInput): Promise<TranslateAndSimplifyOutput> {
  return translateAndSimplifyFlow(input);
}

const translateAndSimplifyFlow = ai.defineFlow(
  {
    name: 'translateAndSimplifyFlow',
    inputSchema: TranslateAndSimplifyInputSchema,
    outputSchema: TranslateAndSimplifyOutputSchema,
  },
  async input => {
    // Simplify the document first
    const simplificationResult = await simplifyDocument({
      fileDataUri: input.fileDataUri,
      language: input.language === 'en' ? 'en' : 'en',
    });

    // Translate the simplified content to the target language
    const translatePromises = {
      summary: translateText({text: simplificationResult.summary, targetLanguage: input.language}),
      whatItMeans: translateText({text: simplificationResult.whatItMeans, targetLanguage: input.language}),
      actions: Promise.all(
        simplificationResult.actions.map(action => ({
          step: translateText({text: action.step, targetLanguage: input.language}),
          deadline: action.deadline ? translateText({text: action.deadline, targetLanguage: input.language}) : Promise.resolve({translatedText: undefined}),
        }).step)
      ),
      consequences: translateText({text: simplificationResult.consequences, targetLanguage: input.language}),
      helplines: Promise.all(simplificationResult.helplines.map(helpline => translateText({text: helpline, targetLanguage: input.language}))),
      disclaimer: translateText({text: simplificationResult.disclaimer, targetLanguage: input.language}),
    };

    const translatedResults = await Promise.allSettled(Object.values(translatePromises));

    const fulfilledTranslations = translatedResults.filter((result): result is PromiseFulfilledResult<{ translatedText: string }> => result.status === 'fulfilled').map(result => result.value.translatedText);
    
    const actions = await Promise.all(simplificationResult.actions.map(async action => {
      const step = await translateText({text: action.step, targetLanguage: input.language});
      let deadline: TranslateTextOutput | undefined = undefined
      if (action.deadline) {
          deadline = await translateText({text: action.deadline, targetLanguage: input.language})
      }

      return {
        step: step.translatedText,
        deadline: deadline?.translatedText
      };
    }));

    return {
      summary: (await translatePromises.summary).translatedText,
      whatItMeans: (await translatePromises.whatItMeans).translatedText,
      actions: actions,
      consequences: (await translatePromises.consequences).translatedText,
      helplines: await Promise.all(simplificationResult.helplines.map(async helpline => (await translateText({text: helpline, targetLanguage: input.language})).translatedText)),
      disclaimer: (await translatePromises.disclaimer).translatedText,
    };
  }
);
