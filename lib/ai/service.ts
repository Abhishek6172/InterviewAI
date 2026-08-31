import { AIService } from "./types";
import { OpenRouterAIService } from "./openrouter";
import { GeminiAIService } from "./gemini";
import { MockAIService } from "./mock";

let cachedService: AIService | null = null;

export function getAIService(): AIService {
  if (cachedService) return cachedService;

  const openRouterKey =
    process.env.OPENROUTER_API_KEY ||
    (process.env.AI_API_KEY?.startsWith("sk-or-") ? process.env.AI_API_KEY : undefined);
  const openRouterBaseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
  const openRouterModel = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";

  // 1. OpenRouter Provider
  if (openRouterKey) {
    try {
      console.log(`[InterviewAI] Initializing OpenRouter Provider (Model: ${openRouterModel})`);
      cachedService = new OpenRouterAIService(openRouterKey, openRouterBaseUrl, openRouterModel);
      return cachedService;
    } catch (err) {
      console.warn("Failed to initialize OpenRouter service:", err);
    }
  }

  // 2. Google Gemini Native Provider
  const geminiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  const geminiModel = process.env.AI_MODEL || "gemini-1.5-flash";

  if (geminiKey && geminiKey !== "your_gemini_or_openai_api_key_here") {
    try {
      console.log(`[InterviewAI] Initializing Gemini Provider (Model: ${geminiModel})`);
      cachedService = new GeminiAIService(geminiKey, geminiModel);
      return cachedService;
    } catch (err) {
      console.warn("Failed to initialize Gemini service:", err);
    }
  }

  // 3. Deterministic Mock Fallback
  console.log("[InterviewAI] Running with Deterministic Mock Provider (Zero API dependencies)");
  cachedService = new MockAIService();
  return cachedService;
}
