import { NextResponse } from "next/server";
import { getAIService } from "@/lib/ai/service";
import { GenerateQuestionsRequest } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const body: GenerateQuestionsRequest = await req.json();

    if (!body.role || !body.difficulty || !body.interviewType) {
      return NextResponse.json(
        { error: "Missing required fields: role, difficulty, or interviewType" },
        { status: 400 }
      );
    }

    const aiService = getAIService();
    const result = await aiService.generateQuestions({
      role: body.role,
      difficulty: body.difficulty,
      interviewType: body.interviewType,
      experienceLevel: body.experienceLevel || "Fresher",
      count: Number(body.count) || 5,
      resumeText: body.resumeText || "",
      conversationHistory: body.conversationHistory || [],
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/interview/generate Error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions. Please retry." },
      { status: 500 }
    );
  }
}
