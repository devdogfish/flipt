import { createOpenAI } from "@ai-sdk/openai";

const provider = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Always use chat completions — OpenRouter free models don't reliably support the Responses API
export const openrouter = (model: string) => provider.chat(model);

// Free models with confirmed endpoints, structured output support, and large context windows.
// Ordered by preference; each is from a different provider for redundancy.
export const FREE_MODELS = [
  "qwen/qwen3-next-80b-a3b-instruct:free",       // Alibaba — 256K ctx, structured output
  "nvidia/nemotron-3-super-120b-a12b:free",       // NVIDIA  — 256K ctx, strong reasoning
  "arcee-ai/trinity-large-preview:free",           // Arcee AI — 131K ctx, independent
  "nvidia/nemotron-nano-9b-v2:free",              // NVIDIA  — 128K ctx, fast fallback
] as const;

export const PRIMARY_MODEL = FREE_MODELS[0];
export const FALLBACK_MODEL = FREE_MODELS[1];
