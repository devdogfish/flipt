import { generateText } from "ai";
import { openrouter, PRIMARY_MODEL } from "@/lib/ai";


export type ExtractResult = {
  text: string;
  /** base64 data URLs for any uploaded images (for card attribution later) */
  imageDataUrls: string[];
};

export async function extractTextFromFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<ExtractResult> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";

  // Plain text / markdown
  if (ext === "txt" || ext === "md" || mimeType === "text/plain" || mimeType === "text/markdown") {
    return { text: buffer.toString("utf-8"), imageDataUrls: [] };
  }

  // PDF
  if (ext === "pdf" || mimeType === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer, verbosity: 0 });
    const result = await parser.getText();
    await parser.destroy();
    return { text: result.text, imageDataUrls: [] };
  }

  // DOCX / DOC
  if (
    ext === "docx" ||
    ext === "doc" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value, imageDataUrls: [] };
  }

  // Images — use vision model to describe
  if (
    mimeType.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp"].includes(ext)
  ) {
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const { text } = await generateText({
      model: openrouter(PRIMARY_MODEL),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: dataUrl,
            },
            {
              type: "text",
              text: "Describe this image in one sentence. Be specific about the subject matter and any labels, diagrams, or data shown.",
            },
          ],
        },
      ],
    });

    return {
      text: `[Image content: ${text.trim()}]`,
      imageDataUrls: [dataUrl],
    };
  }

  throw new Error(`Unsupported file type: ${filename}`);
}
