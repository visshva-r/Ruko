import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeminiVerdictPayload } from "./types";

const GEMINI_MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `You are RUKO, a digital safety assistant for Indian families analyzing scam messages (WhatsApp, SMS, email).
Return ONLY valid JSON matching this schema:
{
  "level": "stop" | "caution" | "safe",
  "score": number 0-100 (higher = more dangerous),
  "intent": string (what attacker wants in next minute, English),
  "intentHi": string (same in Hindi Devanagari),
  "safeAction": string (one clear action for the victim, English),
  "safeActionHi": string (same in Hindi Devanagari),
  "replyEn": string (short reply to paste in English),
  "replyHi": string (short reply in Hindi, Devanagari),
  "spokenLineEn": string (one sentence for a parent to hear),
  "spokenLineHi": string (same in Hindi Devanagari),
  "evidence": [{ "quote": string (exact substring from message), "reason": string }]
}
Rules:
- "stop" for OTP requests, UPI to unknown handles, impersonation, remote access, phishing links.
- "caution" for suspicious but incomplete signals.
- "safe" only when message is clearly benign.
- evidence quotes MUST appear verbatim in the source text.`;

function getApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}

export async function analyzeWithGemini(
  text: string,
  image?: { base64: string; mimeType: string },
): Promise<GeminiVerdictPayload | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
    { text: `${SYSTEM_PROMPT}\n\nMessage to analyze:\n"""${text || "(see image)"}"""` },
  ];

  if (image?.base64) {
    parts.push({
      inlineData: {
        data: image.base64,
        mimeType: image.mimeType || "image/png",
      },
    });
  }

  try {
    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const raw = result.response.text();
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeminiVerdictPayload;
    if (!parsed.level || !Array.isArray(parsed.evidence)) return null;
    return parsed;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[RUKO] Gemini analyze failed:", err);
    }
    return null;
  }
}

export async function extractTextFromImage(
  image: { base64: string; mimeType: string },
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) return "";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Extract all visible text from this screenshot of a chat or SMS. Return plain text only, preserve line breaks.",
            },
            {
              inlineData: {
                data: image.base64,
                mimeType: image.mimeType || "image/png",
              },
            },
          ],
        },
      ],
    });
    return result.response.text()?.trim() ?? "";
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[RUKO] Gemini OCR failed:", err);
    }
    return "";
  }
}
