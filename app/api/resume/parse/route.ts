import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();

    let extractedText = "";

    if (fileName.endsWith(".pdf")) {
      // Dynamic import / require for pdf-parse compatibility
      const pdf = require("pdf-parse");
      const parsed = await pdf(buffer);
      extractedText = parsed.text;
    } else {
      // Plain text, markdown, csv, or json
      extractedText = buffer.toString("utf-8");
    }

    // Clean up excessive whitespace while preserving structure
    const cleanedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return NextResponse.json({
      success: true,
      fileName: file.name,
      text: cleanedText,
      charCount: cleanedText.length,
    });
  } catch (err: any) {
    console.error("Resume parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse resume document: " + (err?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
