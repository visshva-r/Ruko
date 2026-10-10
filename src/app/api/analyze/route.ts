import { NextResponse } from "next/server";
import { analyzeWithGemini, extractTextFromImage } from "@/lib/gemini";
import { getFixture } from "@/lib/fixtures";
import { mergeVerdicts } from "@/lib/merge-verdict";
import { analyzeWithRules, verdictFromRulesOnly } from "@/lib/rules";
import type { AnalyzeRequest } from "@/lib/types";

export async function POST(request: Request) {
  let body: AnalyzeRequest;
  try {
    body = (await request.json()) as AnalyzeRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.fixtureId) {
    const fixture = getFixture(body.fixtureId);
    if (!fixture) {
      return NextResponse.json({ error: "Unknown demo case" }, { status: 404 });
    }
    const { ruleHits } = analyzeWithRules(fixture.text);
    return NextResponse.json({
      verdict: { ...fixture.verdict, ruleHits },
    });
  }

  let text = (body.text ?? "").trim();
  const image =
    body.imageBase64 && body.imageMimeType
      ? { base64: body.imageBase64, mimeType: body.imageMimeType }
      : undefined;

  if (!text && image) {
    text = await extractTextFromImage(image);
  }

  if (!text && !image) {
    return NextResponse.json(
      { error: "Paste a message, upload a screenshot, or pick a demo case." },
      { status: 400 },
    );
  }

  const rulesVerdict = verdictFromRulesOnly(text || "Screenshot message (text extracted by AI)");
  if (text) {
    rulesVerdict.sourceText = text;
  }

  const gemini = await analyzeWithGemini(text, image);
  const verdict = mergeVerdicts(
    text || rulesVerdict.sourceText,
    rulesVerdict,
    gemini,
  );

  if (!text && image && verdict.sourceText === rulesVerdict.sourceText) {
    verdict.sourceText =
      "[Screenshot] Text was analyzed visually. Paste extracted text here if you want to edit.";
  }

  return NextResponse.json({
    verdict,
    meta: {
      usedGemini: Boolean(gemini),
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    },
  });
}
