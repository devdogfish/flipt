import { generateObject } from "ai";
import { z } from "zod";
import { openrouter, FREE_MODELS } from "@/lib/ai";

const FLASHCARD_SYSTEM_PROMPT = `You are a flashcard generator for university students. Given document content, create high-quality flashcards that test understanding, not just recall.

Rules:
- Create between 10-50 cards depending on content density
- Vary question types: definitions, comparisons, cause-effect, application, "why" questions
- Questions should be specific and unambiguous
- Answers should be concise (1-3 sentences) but complete
- Do NOT create trivial questions like "What is the title of this document?"
- Do NOT repeat the same concept in multiple cards
- If the content is too short or vague, create fewer but higher quality cards
- Suggest a deck title and description based on the content`;

const flashcardSetSchema = z.object({
  deckTitle: z.string().describe("A concise title for this deck based on the content"),
  deckDescription: z
    .string()
    .describe("1-2 sentence description of what this deck covers"),
  cards: z
    .array(
      z.object({
        question: z.string().describe("Clear, specific question"),
        answer: z.string().describe("Concise but complete answer"),
      }),
    )
    .min(1)
    .max(50),
});

export type GeneratedFlashcardSet = z.infer<typeof flashcardSetSchema>;

export async function generateFlashcards(
  extractedText: string,
): Promise<GeneratedFlashcardSet> {
  const messages = [
    {
      role: "system" as const,
      content: FLASHCARD_SYSTEM_PROMPT,
    },
    {
      role: "user" as const,
      content: `Generate flashcards from the following document content:\n\n${extractedText}`,
    },
  ];

  let lastError: unknown;

  for (const model of FREE_MODELS) {
    try {
      console.log(`[generateFlashcards] Trying model: ${model}`);
      const result = await generateObject({
        model: openrouter(model),
        schema: flashcardSetSchema,
        messages,
      });
      console.log(`[generateFlashcards] Success with model: ${model}`);
      return result.object;
    } catch (err) {
      console.warn(`[generateFlashcards] Model ${model} failed:`, (err as Error).message);
      lastError = err;
    }
  }

  console.error("[generateFlashcards] All models failed. Last error:", lastError);
  throw new Error(
    "Generation failed. All models are temporarily unavailable — please try again in a minute.",
  );
}
