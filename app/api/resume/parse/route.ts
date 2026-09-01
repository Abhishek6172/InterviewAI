import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import PDFParser from "pdf2json";
import mammoth from "mammoth";

function parsePDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    try {
      const pdfParser = new (PDFParser as any)(null, true);

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.warn("PDFParser data error:", errData);
        resolve(fallbackExtractTextFromPDF(buffer));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          let parsedText = "";

          // Extract and decode URL-encoded text from PDF pages
          if (pdfData && Array.isArray(pdfData.Pages)) {
            for (const page of pdfData.Pages) {
              if (Array.isArray(page.Texts)) {
                for (const textItem of page.Texts) {
                  if (Array.isArray(textItem.R)) {
                    for (const r of textItem.R) {
                      if (r.T) {
                        try {
                          parsedText += decodeURIComponent(r.T) + " ";
                        } catch {
                          parsedText += r.T + " ";
                        }
                      }
                    }
                  }
                }
              }
              parsedText += "\n";
            }
          }

          if (parsedText.trim().length > 30) {
            resolve(parsedText);
          } else {
            const raw = pdfParser.getRawTextContent();
            if (raw && raw.trim().length > 30) {
              resolve(raw);
            } else {
              resolve(fallbackExtractTextFromPDF(buffer));
            }
          }
        } catch (e) {
          console.warn("Error decoding PDF text:", e);
          resolve(fallbackExtractTextFromPDF(buffer));
        }
      });

      pdfParser.parseBuffer(buffer);
    } catch (e) {
      console.warn("PDF parseBuffer exception, falling back:", e);
      resolve(fallbackExtractTextFromPDF(buffer));
    }
  });
}

function fallbackExtractTextFromPDF(buffer: Buffer): string {
  try {
    const raw = buffer.toString("binary");
    const matches = raw.match(/\((?:\\\(|\\\)|[^()])*\)|\[(?:[^\]])*\]/g);
    if (matches && matches.length > 0) {
      return matches
        .map((m) => m.replace(/[\(\)\[\]\\]/g, " "))
        .filter((t) => /[a-zA-Z0-9]/.test(t) && t.length > 2)
        .join(" ")
        .slice(0, 4000);
    }
    return buffer
      .toString("utf-8")
      .replace(/[^\x20-\x7E\n\r]/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 4000);
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No resume file received." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();

    let extractedText = "";

    if (fileName.endsWith(".pdf")) {
      extractedText = await parsePDF(buffer);
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    } else {
      extractedText = buffer.toString("utf-8");
    }

    // Clean up formatting
    const cleanedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\t/g, " ")
      .replace(/ +/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanedText || cleanedText.length < 10) {
      return NextResponse.json(
        { error: "Could not detect readable text in this document. Please paste your resume text manually." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      text: cleanedText,
      charCount: cleanedText.length,
    });
  } catch (err: any) {
    console.error("Resume parse error:", err);
    return NextResponse.json(
      { error: "Failed to extract text from document: " + (err?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
