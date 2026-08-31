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

export class GeminiAIService implements AIService {
  private apiKey: string;
  private model: string;
  private fallbackService: MockAIService;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
    this.fallbackService = new MockAIService();
  }

  private async callGeminiWithRetry(systemInstruction: string, promptText: string, retries = 1): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }],
            },
            contents: [
              {
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.65,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          throw new Error("Empty response text from Gemini");
        }

        // Clean out any accidental markdown formatting
        const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned);
      } catch (err) {
        if (attempt === retries) {
          throw err;
        }
        await new Promise((r) => setTimeout(r, 800));
      }
    }
  }

  async generateQuestions(req: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
    try {
      const prompt = createQuestionsPrompt(req);
      const parsed = await this.callGeminiWithRetry(INTERVIEWER_SYSTEM_PROMPT, prompt);

      if (parsed?.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return { questions: parsed.questions };
      }
      throw new Error("Invalid questions response schema");
    } catch (err) {
      console.warn("Gemini question generation error, using fallback:", err);
      return this.fallbackService.generateQuestions(req);
    }
  }

  async evaluateAnswer(req: EvaluateAnswerRequest): Promise<EvaluateAnswerResponse> {
    try {
      const prompt = createEvaluationPrompt(req);
      const parsed = await this.callGeminiWithRetry(INTERVIEWER_SYSTEM_PROMPT, prompt);

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
            contextHint: "Contextual follow-up based on your previous answer.",
          };
        }
        return { evaluation: parsed.evaluation, followUpQuestion };
      }
      throw new Error("Invalid evaluation response schema");
    } catch (err) {
      console.warn("Gemini evaluation error, using fallback:", err);
      return this.fallbackService.evaluateAnswer(req);
    }
  }

  async generateScorecard(req: GenerateScorecardRequest): Promise<GenerateScorecardResponse> {
    try {
      const prompt = createScorecardPrompt(req);
      const parsed = await this.callGeminiWithRetry(INTERVIEWER_SYSTEM_PROMPT, prompt);

      if (parsed?.scorecard) {
        return { scorecard: parsed.scorecard };
      }
      throw new Error("Invalid scorecard response schema");
    } catch (err) {
      console.warn("Gemini scorecard generation error, using fallback:", err);
      return this.fallbackService.generateScorecard(req);
    }
  }
}
