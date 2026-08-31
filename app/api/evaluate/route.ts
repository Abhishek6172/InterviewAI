import { NextResponse } from "next/server";
import { getAIService } from "@/lib/ai/service";
import { EvaluateAnswerRequest, GenerateScorecardRequest } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const aiService = getAIService();

    // Mode 1: Full Scorecard Generation
    if (body.type === "scorecard") {
      const scorecardReq: GenerateScorecardRequest = {
        role: body.role || "Software Engineer",
        difficulty: body.difficulty || "medium",
        interviewType: body.interviewType || "mixed",
        experienceLevel: body.experienceLevel || "Fresher",
        questions: body.questions || [],
        answers: body.answers || {},
        evaluations: body.evaluations || {},
      };

      const result = await aiService.generateScorecard(scorecardReq);
      return NextResponse.json(result);
    }

    // Mode 2: Single Question Answer Evaluation
    const evalReq: EvaluateAnswerRequest = {
      role: body.role || "Software Engineer",
      difficulty: body.difficulty || "medium",
      interviewType: body.interviewType || "mixed",
      experienceLevel: body.experienceLevel || "Fresher",
      question: body.question,
      userAnswer: body.userAnswer || "",
      conversationHistory: body.conversationHistory || [],
      canFollowUp: body.canFollowUp !== undefined ? body.canFollowUp : true,
    };

    if (!evalReq.question || typeof evalReq.userAnswer !== "string") {
      return NextResponse.json(
        { error: "Missing required question or userAnswer field." },
        { status: 400 }
      );
    }

    const result = await aiService.evaluateAnswer(evalReq);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/evaluate Error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer. Continuing session gracefully." },
      { status: 500 }
    );
  }
}
