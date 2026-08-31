import { NextResponse } from "next/server";
import { ValidationFeedback } from "@/types/analytics";

// In-memory feedback records for fast prototype validation
const feedbackStore: ValidationFeedback[] = [];

export async function POST(req: Request) {
  try {
    const body: ValidationFeedback = await req.json();

    if (!body.sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const newFeedback: ValidationFeedback = {
      id: body.id || `fb_${Date.now()}`,
      sessionId: body.sessionId,
      isUseful: body.isUseful ?? null,
      experienceRating: body.experienceRating || 5,
      improvementSuggestions: body.improvementSuggestions || "",
      submittedAt: body.submittedAt || new Date().toISOString(),
    };

    feedbackStore.push(newFeedback);

    return NextResponse.json({
      success: true,
      message: "Feedback recorded successfully",
      totalFeedbackCount: feedbackStore.length,
    });
  } catch (error: any) {
    console.error("API /api/feedback Error:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    total: feedbackStore.length,
    feedbacks: feedbackStore,
  });
}
