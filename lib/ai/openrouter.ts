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
    primaryModel: string = "nvidia/nemotron-3.5-lightning:free"
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.primaryModel = primaryModel;
    this.fallbackService = new MockAIService();
  }

  private cleanAndParseJSON(rawContent: string): any {
    if (!rawContent) throw new Error("Empty response from OpenRouter");

    // Look for ```json ... ``` code blocks first
    const codeBlockMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/i);
    let text = codeBlockMatch ? codeBlockMatch[1].trim() : rawContent.trim();

    // Remove any HTML or thinking tags
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // Find the outermost JSON block { ... }
    const firstOpen = text.indexOf("{");
    const lastClose = text.lastIndexOf("}");
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      text = text.substring(firstOpen, lastClose + 1);
    }

    return JSON.parse(text);
  }

  private async callOpenRouter(
    systemInstruction: string,
    promptText: string,
    maxTokens: number = 1200,
    timeoutMs: number = 7500
  ): Promise<any> {
    const url = `${this.baseUrl}/chat/completions`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://interview-ai-five-weld.vercel.app",
          "X-Title": "InterviewAI",
        },
        body: JSON.stringify({
          model: this.primaryModel,
          max_tokens: maxTokens,
          messages: [
            {
              role: "system",
              content: systemInstruction + "\nYou MUST output strictly valid JSON immediately. No preamble or reasoning.",
            },
            {
              role: "user",
              content: promptText,
            },
          ],
          temperature: 0.3,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenRouter returned status ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data?.choices?.[0]?.message?.content;
      if (!rawContent) throw new Error("Empty choices content from OpenRouter");

      return this.cleanAndParseJSON(rawContent);
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  async generateQuestions(req: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
    try {
      const prompt = createQuestionsPrompt(req);
      const parsed = await this.callOpenRouter(INTERVIEWER_SYSTEM_PROMPT, prompt, 1400, 7500);

      if (parsed?.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return {
          questions: parsed.questions.map((q: any, idx: number) => ({
            id: q.id || `q_${Date.now()}_${idx + 1}`,
            order: idx + 1,
            question: q.question,
            category: q.category || "technical",
            difficulty: req.difficulty,
            contextHint: q.contextHint || `Focus on ${req.role} principles and practical experience.`,
            expectedTopics: q.expectedTopics || [],
          })),
        };
      }
      throw new Error("Invalid questions schema from OpenRouter");
    } catch (err) {
      console.warn("OpenRouter question generation fallback triggered:", err);
      return this.fallbackService.generateQuestions(req);
    }
  }

  async evaluateAnswer(req: EvaluateAnswerRequest): Promise<EvaluateAnswerResponse> {
    try {
      const prompt = createEvaluationPrompt(req);
      const parsed = await this.callOpenRouter(INTERVIEWER_SYSTEM_PROMPT, prompt, 800, 3500);

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
      return this.fallbackService.evaluateAnswer(req);
    }
  }

  async generateScorecard(req: GenerateScorecardRequest): Promise<GenerateScorecardResponse> {
    try {
      const prompt = createScorecardPrompt(req);
      const parsed = await this.callOpenRouter(INTERVIEWER_SYSTEM_PROMPT, prompt, 1200, 4500);

      if (parsed?.scorecard) {
        return { scorecard: parsed.scorecard };
      }
      throw new Error("Invalid scorecard schema from OpenRouter");
    } catch (err) {
      return this.fallbackService.generateScorecard(req);
    }
  }
}
