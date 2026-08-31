/**
 * Google Form Integration Configuration
 * 
 * To connect your live feedback to your own Google Form:
 * 1. Create a Google Form with fields: Name, Overall Experience, AI Realism, Audio Quality, Liked Most, Suggestions.
 * 2. Click "Get pre-filled link" in Google Form settings to find the entry IDs (e.g., entry.123456789).
 * 3. Set the variables below or add them to your .env.local file!
 */

export interface GoogleFormConfig {
  actionUrl: string;
  entryName?: string;
  entryEmail?: string;
  entryOverallExperience?: string;
  entryAiRealism?: string;
  entryAudioExperience?: string;
  entryRolePreparedness?: string;
  entryLikedMost?: string;
  entrySuggestions?: string;
}

export const GOOGLE_FORM_CONFIG: GoogleFormConfig = {
  // Replace with your Google Form submission action URL or set GOOGLE_FORM_ACTION_URL in .env.local
  actionUrl: process.env.GOOGLE_FORM_ACTION_URL || "",
  
  // Mapping of Google Form Entry IDs:
  entryName: process.env.GOOGLE_FORM_ENTRY_NAME || "entry.1000001",
  entryEmail: process.env.GOOGLE_FORM_ENTRY_EMAIL || "entry.1000002",
  entryOverallExperience: process.env.GOOGLE_FORM_ENTRY_OVERALL || "entry.1000003",
  entryAiRealism: process.env.GOOGLE_FORM_ENTRY_REALISM || "entry.1000004",
  entryAudioExperience: process.env.GOOGLE_FORM_ENTRY_AUDIO || "entry.1000005",
  entryRolePreparedness: process.env.GOOGLE_FORM_ENTRY_PREPAREDNESS || "entry.1000006",
  entryLikedMost: process.env.GOOGLE_FORM_ENTRY_LIKED_MOST || "entry.1000007",
  entrySuggestions: process.env.GOOGLE_FORM_ENTRY_SUGGESTIONS || "entry.1000008",
};

/**
 * Submit feedback directly to Google Form
 */
export async function submitToGoogleForm(data: {
  name?: string;
  email?: string;
  overallExperience: number;
  aiRealism: number;
  audioExperience?: number;
  rolePreparedness?: string;
  likedMost?: string;
  suggestions?: string;
}): Promise<boolean> {
  const url = GOOGLE_FORM_CONFIG.actionUrl;
  if (!url || !url.startsWith("https://docs.google.com/forms/")) {
    // If no Google Form URL is set yet, log gracefully
    return false;
  }

  try {
    const formData = new URLSearchParams();

    if (data.name && GOOGLE_FORM_CONFIG.entryName) {
      formData.append(GOOGLE_FORM_CONFIG.entryName, data.name);
    }
    if (data.email && GOOGLE_FORM_CONFIG.entryEmail) {
      formData.append(GOOGLE_FORM_CONFIG.entryEmail, data.email);
    }
    if (GOOGLE_FORM_CONFIG.entryOverallExperience) {
      formData.append(GOOGLE_FORM_CONFIG.entryOverallExperience, `${data.overallExperience} / 5`);
    }
    if (GOOGLE_FORM_CONFIG.entryAiRealism) {
      formData.append(GOOGLE_FORM_CONFIG.entryAiRealism, `${data.aiRealism} / 5`);
    }
    if (data.audioExperience && GOOGLE_FORM_CONFIG.entryAudioExperience) {
      formData.append(GOOGLE_FORM_CONFIG.entryAudioExperience, `${data.audioExperience} / 5`);
    }
    if (data.rolePreparedness && GOOGLE_FORM_CONFIG.entryRolePreparedness) {
      formData.append(GOOGLE_FORM_CONFIG.entryRolePreparedness, data.rolePreparedness);
    }
    if (data.likedMost && GOOGLE_FORM_CONFIG.entryLikedMost) {
      formData.append(GOOGLE_FORM_CONFIG.entryLikedMost, data.likedMost);
    }
    if (data.suggestions && GOOGLE_FORM_CONFIG.entrySuggestions) {
      formData.append(GOOGLE_FORM_CONFIG.entrySuggestions, data.suggestions);
    }

    const res = await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    return true;
  } catch (err) {
    console.warn("Could not post to Google Form directly:", err);
    return false;
  }
}
