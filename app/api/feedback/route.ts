import { NextResponse } from "next/server";
import { ValidationFeedback } from "@/types/analytics";
import { submitToGoogleForm, GOOGLE_FORM_CONFIG } from "@/lib/config/google-form";
import fs from "fs";
import path from "path";

const FEEDBACK_DATA_PATH = path.join(
  process.env.TMPDIR || process.env.TEMP || "/tmp",
  "interviewai_feedback_store.json"
);

let feedbackStore: ValidationFeedback[] = [];

// Load feedback from persistent disk
function loadFeedbackFromDisk(): void {
  try {
    if (typeof window === "undefined" && fs.existsSync(FEEDBACK_DATA_PATH)) {
      const content = fs.readFileSync(FEEDBACK_DATA_PATH, "utf-8");
      const data = JSON.parse(content);
      if (Array.isArray(data.feedbacks)) {
        feedbackStore = data.feedbacks;
      }
    }
  } catch (err) {
    console.warn("Could not read feedback from disk:", err);
  }
}

// Save feedback to persistent disk
function saveFeedbackToDisk(): void {
  try {
    if (typeof window === "undefined") {
      const payload = {
        feedbacks: feedbackStore,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(FEEDBACK_DATA_PATH, JSON.stringify(payload, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not write feedback to disk:", err);
  }
}

loadFeedbackFromDisk();

export async function POST(req: Request) {
  try {
    const body: ValidationFeedback = await req.json();

    if (!body.sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    loadFeedbackFromDisk();

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
      id: body.id || `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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

    feedbackStore.unshift(newFeedback);
    saveFeedbackToDisk();

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
  loadFeedbackFromDisk();
  return NextResponse.json({
    total: feedbackStore.length,
    feedbacks: feedbackStore,
  });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (Array.isArray(body.feedbacks)) {
      loadFeedbackFromDisk();
      const map = new Map<string, ValidationFeedback>();
      feedbackStore.forEach((f) => map.set(f.id, f));
      body.feedbacks.forEach((f: ValidationFeedback) => {
        if (f && f.id) map.set(f.id, f);
      });
      feedbackStore = Array.from(map.values()).sort((a, b) => {
        return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
      });
      saveFeedbackToDisk();
      return NextResponse.json({ success: true, total: feedbackStore.length, feedbacks: feedbackStore });
    }
    return NextResponse.json({ error: "Invalid feedbacks array" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to sync feedbacks" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    loadFeedbackFromDisk();

    if (body.clearAll) {
      feedbackStore = [];
      saveFeedbackToDisk();
      return NextResponse.json({
        success: true,
        message: "All feedback records cleared successfully",
      });
    }

    if (body.feedbackId) {
      feedbackStore = feedbackStore.filter((f) => f.id !== body.feedbackId);
      saveFeedbackToDisk();
      return NextResponse.json({
        success: true,
        message: `Feedback ${body.feedbackId} deleted successfully`,
      });
    }

    return NextResponse.json({ error: "Missing feedbackId or clearAll flag" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
  }
}
