import type { GeminiVerdictPayload, Verdict, VerdictLevel } from "./types";
import { analyzeWithRules } from "./rules";

const levelRank: Record<VerdictLevel, number> = {
  safe: 0,
  caution: 1,
  stop: 2,
};

function pickLevel(a: VerdictLevel, b: VerdictLevel): VerdictLevel {
  return levelRank[a] >= levelRank[b] ? a : b;
}

export function mergeVerdicts(
  text: string,
  rulesVerdict: Verdict,
  gemini?: GeminiVerdictPayload | null,
): Verdict {
  if (!gemini) {
    return { ...rulesVerdict, analyzedBy: "rules" };
  }

  const { ruleHits, score: ruleScore, level: ruleLevel } = analyzeWithRules(text);
  const level = pickLevel(ruleLevel, gemini.level);
  const score = Math.max(ruleScore, gemini.score, level === "stop" ? 70 : level === "caution" ? 40 : 10);

  const evidenceMap = new Map<string, { quote: string; reason: string }>();
  for (const e of [...rulesVerdict.evidence, ...gemini.evidence]) {
    const key = e.quote.toLowerCase().trim();
    if (!key) continue;
    if (!evidenceMap.has(key)) evidenceMap.set(key, e);
  }

  return {
    level,
    score: Math.min(98, score),
    intent: gemini.intent || rulesVerdict.intent,
    intentHi: gemini.intentHi || rulesVerdict.intentHi,
    safeAction: gemini.safeAction || rulesVerdict.safeAction,
    safeActionHi: gemini.safeActionHi || rulesVerdict.safeActionHi,
    replyEn: gemini.replyEn || rulesVerdict.replyEn,
    replyHi: gemini.replyHi || rulesVerdict.replyHi,
    spokenLineEn: gemini.spokenLineEn || rulesVerdict.spokenLineEn,
    spokenLineHi: gemini.spokenLineHi || rulesVerdict.spokenLineHi,
    evidence: Array.from(evidenceMap.values()).slice(0, 6),
    ruleHits,
    sourceText: text,
    analyzedBy: "hybrid",
  };
}
