import { NextResponse } from "next/server";
import { ValidationFeedback } from "@/types/analytics";
import { submitToGoogleForm, GOOGLE_FORM_CONFIG } from "@/lib/config/google-form";

// In-memory feedback records for fast prototype validation
const feedbackStore: ValidationFeedback[] = [];

export async function POST(req: Request) {
  try {
    const body: ValidationFeedback = await req.json();

    if (!body.sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Try posting directly to Google Form if action URL is configured
    let googleSynced = false;
    if (GOOGLE_FORM_CONFIG.actionUrl) {
      googleSynced = await submitToGoogleForm({
        name: body.name,
        email: body.email,
        overallExperience: body.overallExperience || 5,
        aiRealism: body.aiRealism || 5,
        audioExperience: body.audioExperience || 5,
        rolePreparedness: body.rolePreparedness,
        likedMost: body.likedMost,
        suggestions: body.improvementSuggestions || body.confusingAspects,
      });
    }

    const newFeedback: ValidationFeedback = {
      id: body.id || `fb_${Date.now()}`,
      sessionId: body.sessionId,
      name: body.name || "Anonymous Candidate",
      email: body.email || "",
      isUseful: body.isUseful ?? true,
      overallExperience: body.overallExperience || 5,
      aiRealism: body.aiRealism || 5,
      audioExperience: body.audioExperience || 5,
      rolePreparedness: body.rolePreparedness || "much_more_prepared",
      likedMost: body.likedMost || "",
      confusingAspects: body.confusingAspects || "",
      improvementSuggestions: body.improvementSuggestions || "",
      wouldUseAgain: body.wouldUseAgain || "yes",
      submittedAt: body.submittedAt || new Date().toISOString(),
      googleFormSynced: googleSynced,
    };

    feedbackStore.push(newFeedback);

    return NextResponse.json({
      success: true,
      message: googleSynced ? "Feedback recorded & synced to Google Form!" : "Feedback recorded successfully",
      googleFormSynced: googleSynced,
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
