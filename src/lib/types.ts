export type VerdictLevel = "stop" | "caution" | "safe";

export interface EvidenceItem {
  quote: string;
  reason: string;
}

export interface RuleHit {
  id: string;
  label: string;
  severity: "high" | "medium" | "low";
  matched: string;
}

export interface Verdict {
  level: VerdictLevel;
  score: number;
  intent: string;
  intentHi: string;
  safeAction: string;
  safeActionHi: string;
  replyEn: string;
  replyHi: string;
  spokenLineEn: string;
  spokenLineHi: string;
  evidence: EvidenceItem[];
  ruleHits: RuleHit[];
  sourceText: string;
  analyzedBy: "fixture" | "rules" | "gemini" | "hybrid";
}

export interface AnalyzeRequest {
  text?: string;
  fixtureId?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface GeminiVerdictPayload {
  level: VerdictLevel;
  score: number;
  intent: string;
  intentHi: string;
  safeAction: string;
  safeActionHi: string;
  replyEn: string;
  replyHi: string;
  spokenLineEn: string;
  spokenLineHi: string;
  evidence: EvidenceItem[];
}
