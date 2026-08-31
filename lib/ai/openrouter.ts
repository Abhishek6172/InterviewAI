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
  private model: string;
  private fallbackService: MockAIService;

  constructor(
    apiKey: string,
    baseUrl: string = "https://openrouter.ai/api/v1",
    model: string = "google/gemini-2.0-flash-001"
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.model = model;
    this.fallbackService = new MockAIService();
  }

  private async callOpenRouter(systemInstruction: string, promptText: string, retries = 1): Promise<any> {
    const url = `${this.baseUrl}/chat/completions`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "InterviewAI",
          },
          body: JSON.stringify({
            model: this.model,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: systemInstruction + "\nYou MUST return valid JSON adhering to the specified schema.",
              },
              {
                role: "user",
                content: promptText,
              },
            ],
            temperature: 0.65,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenRouter API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const rawContent = data?.choices?.[0]?.message?.content;
        if (!rawContent) {
          throw new Error("No content returned from OpenRouter");
        }

        // Clean out possible markdown codeblocks
        const cleaned = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned);
      } catch (err) {
        console.warn(`OpenRouter attempt ${attempt + 1} failed:`, err);
        if (attempt === retries) {
          throw err;
        }
        await new Promise((r) => setTimeout(r, 600));
      }
    }
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
      console.warn("OpenRouter question generation error, falling back to mock:", err);
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
      console.warn("OpenRouter evaluation error, falling back to mock:", err);
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
      console.warn("OpenRouter scorecard generation error, falling back to mock:", err);
      return this.fallbackService.generateScorecard(req);
    }
  }
}
