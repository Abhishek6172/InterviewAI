import {
  AIService,
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  EvaluateAnswerRequest,
  EvaluateAnswerResponse,
  GenerateScorecardRequest,
  GenerateScorecardResponse,
} from "./types";
import {
  INTERVIEWER_SYSTEM_PROMPT,
  createQuestionsPrompt,
  createEvaluationPrompt,
  createScorecardPrompt,
} from "./prompts";
import { MockAIService } from "./mock";

export class OpenRouterAIService implements AIService {
  private apiKey: string;
  private baseUrl: string;
  private primaryModel: string;
  private fallbackService: MockAIService;

  constructor(
    apiKey: string,
    baseUrl: string = "https://openrouter.ai/api/v1",
    primaryModel: string = "liquid/lfm-2.5-2.6b:free"
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.primaryModel = primaryModel;
    this.fallbackService = new MockAIService();
  }

  private cleanAndParseJSON(rawContent: string): any {
    if (!rawContent) throw new Error("Empty response from OpenRouter");

    // 1. Remove markdown code fences
    let text = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();

    // 2. Locate first '{' and last '}'
    const firstOpen = text.indexOf("{");
    const lastClose = text.lastIndexOf("}");
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      text = text.substring(firstOpen, lastClose + 1);
    }

    return JSON.parse(text);
  }

  private async callOpenRouter(systemInstruction: string, promptText: string): Promise<any> {
    const url = `${this.baseUrl}/chat/completions`;
    const modelsToTry = [
      this.primaryModel,
      "nvidia/nemotron-3.5-lightning:free",
      "google/gemini-2.0-flash-001",
      "meta-llama/llama-3.3-70b-instruct",
    ];

    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[InterviewAI] Calling OpenRouter Model: ${model}`);
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "InterviewAI",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content: systemInstruction + "\nYou MUST return strictly valid JSON.",
              },
              {
                role: "user",
                content: promptText,
              },
            ],
            temperature: 0.6,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[InterviewAI] OpenRouter Model ${model} returned status ${response.status}: ${errText.slice(0, 150)}`);
          continue;
        }

        const data = await response.json();
        const rawContent = data?.choices?.[0]?.message?.content;
        if (!rawContent) {
          console.warn(`[InterviewAI] OpenRouter Model ${model} returned empty content.`);
          continue;
        }

        const parsed = this.cleanAndParseJSON(rawContent);
        console.log(`[InterviewAI] Successfully received and parsed response from ${model}`);
        return parsed;
      } catch (err: any) {
        console.warn(`[InterviewAI] OpenRouter Model ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }

    throw lastError || new Error("All OpenRouter models failed to respond with valid JSON");
  }

  async generateQuestions(req: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
    try {
      const prompt = createQuestionsPrompt(req);
      const parsed = await this.callOpenRouter(INTERVIEWER_SYSTEM_PROMPT, prompt);

      if (parsed?.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return { questions: parsed.questions };
      }
      throw new Error("Invalid questions schema from OpenRouter");
    } catch (err) {
      console.warn("[InterviewAI] OpenRouter question generation fallback triggered:", err);
      return this.fallbackService.generateQuestions(req);
    }
  }

  async evaluateAnswer(req: EvaluateAnswerRequest): Promise<EvaluateAnswerResponse> {
    try {
      const prompt = createEvaluationPrompt(req);
      const parsed = await this.callOpenRouter(INTERVIEWER_SYSTEM_PROMPT, prompt);

      if (parsed?.evaluation) {
        let followUpQuestion = undefined;
        if (parsed.evaluation.shouldFollowUp && parsed.evaluation.followUpQuestionText) {
          followUpQuestion = {
            id: `fu_${Date.now()}`,
            order: req.question.order + 1,
            question: parsed.evaluation.followUpQuestionText,
            category: req.question.category,
            difficulty: req.difficulty,
            isFollowUp: true,
            parentQuestionId: req.question.id,
            contextHint: "Contextual follow-up based on your previous response.",
          };
        }
        return { evaluation: parsed.evaluation, followUpQuestion };
      }
      throw new Error("Invalid evaluation schema from OpenRouter");
    } catch (err) {
      console.warn("[InterviewAI] OpenRouter answer evaluation fallback triggered:", err);
      return this.fallbackService.evaluateAnswer(req);
    }
  }

  async generateScorecard(req: GenerateScorecardRequest): Promise<GenerateScorecardResponse> {
    try {
      const prompt = createScorecardPrompt(req);
      const parsed = await this.callOpenRouter(INTERVIEWER_SYSTEM_PROMPT, prompt);

      if (parsed?.scorecard) {
        return { scorecard: parsed.scorecard };
      }
      throw new Error("Invalid scorecard schema from OpenRouter");
    } catch (err) {
      console.warn("[InterviewAI] OpenRouter scorecard generation fallback triggered:", err);
      return this.fallbackService.generateScorecard(req);
    }
  }
}
