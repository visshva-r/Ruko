import type { RuleHit, Verdict, VerdictLevel } from "./types";

interface RuleDef {
  id: string;
  label: string;
  severity: "high" | "medium" | "low";
  pattern: RegExp;
}

const RULES: RuleDef[] = [
  {
    id: "upi",
    label: "UPI / payment handle",
    severity: "high",
    pattern:
      /\b[\w.-]{3,}@(paytm|ybl|oksbi|okaxis|okhdfcbank|okicici|axl|ibl|upi)\b/gi,
  },
  {
    id: "otp",
    label: "OTP or verification code request",
    severity: "high",
    pattern:
      /\b(otp|one[\s-]?time\s+password|verification\s+code|verify\s+code|share\s+(the\s+)?code)\b/gi,
  },
  {
    id: "no_call",
    label: "Do not call / new number",
    severity: "high",
    pattern:
      /\b(don'?t\s+call|do\s+not\s+call|new\s+number|lost\s+(my\s+)?phone|sim\s+(lost|blocked))\b/gi,
  },
  {
    id: "urgency",
    label: "Artificial urgency",
    severity: "medium",
    pattern:
      /\b(urgent|immediately|right\s+now|within\s+\d+\s*(hours?|mins?)|account\s+(blocked|suspended|locked)|last\s+chance)\b/gi,
  },
  {
    id: "money",
    label: "Money transfer demand",
    severity: "high",
    pattern:
      /(₹\s*[\d,]+|rs\.?\s*[\d,]+|\bsend\s+(money|₹|rs)|\btransfer\b|\bpay\s+now\b)/gi,
  },
  {
    id: "short_link",
    label: "Shortened or suspicious link",
    severity: "medium",
    pattern: /\b(bit\.ly|tinyurl|t\.co|goo\.gl|rb\.gy|wa\.me\/\d{10,})\b/gi,
  },
  {
    id: "remote",
    label: "Screen share / remote access",
    severity: "high",
    pattern:
      /\b(anydesk|teamviewer|screen\s*share|remote\s+access|install\s+(this\s+)?app)\b/gi,
  },
  {
    id: "impersonation",
    label: "Authority impersonation",
    severity: "high",
    pattern:
      /\b(income\s+tax|cyber\s+crime|police|cbi|rbi|kyc\s+update|aadhaar\s+link)\b/gi,
  },
];

function collectMatches(text: string, rule: RuleDef): RuleHit[] {
  const hits: RuleHit[] = [];
  const re = new RegExp(rule.pattern.source, rule.pattern.flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    hits.push({
      id: rule.id,
      label: rule.label,
      severity: rule.severity,
      matched: match[0],
    });
    if (!rule.pattern.global) break;
  }
  return hits;
}

export function analyzeWithRules(text: string): {
  ruleHits: RuleHit[];
  score: number;
  level: VerdictLevel;
} {
  const normalized = text.trim();
  const ruleHits: RuleHit[] = [];
  const seen = new Set<string>();

  for (const rule of RULES) {
    for (const hit of collectMatches(normalized, rule)) {
      const key = `${hit.id}:${hit.matched.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      ruleHits.push(hit);
    }
  }

  let score = 8;
  for (const hit of ruleHits) {
    if (hit.severity === "high") score += 22;
    else if (hit.severity === "medium") score += 12;
    else score += 6;
  }
  score = Math.min(98, score);

  let level: VerdictLevel = "safe";
  const highCount = ruleHits.filter((h) => h.severity === "high").length;
  const medCount = ruleHits.filter((h) => h.severity === "medium").length;

  if (highCount >= 1 || score >= 55) level = "stop";
  else if (medCount >= 1 || score >= 28) level = "caution";
  else if (ruleHits.length === 0) {
    score = Math.max(5, score - 5);
    level = "safe";
  }

  return { ruleHits, score, level };
}

export function verdictFromRulesOnly(text: string): Verdict {
  const { ruleHits, score, level } = analyzeWithRules(text);
  const evidence: Verdict["evidence"] = ruleHits.slice(0, 5).map((h) => ({
    quote: h.matched,
    reason: h.label,
  }));

  const intent =
    level === "stop"
      ? "Likely wants money, OTP, remote access, or quick payment before you verify."
      : level === "caution"
        ? "May be pushing you to act fast — verify the sender before sharing anything."
        : "No strong scam signals detected in this message.";

  const intentHi =
    level === "stop"
      ? "संभवतः पैसे, OTP, रिमोट एक्सेस, या जल्दी भुगतान चाहिए — पुष्टि से पहले।"
      : level === "caution"
        ? "आपको जल्दी कार्रवाई के लिए दबाव दे सकता है — कुछ भी साझा करने से पहले भेजने वाले की पुष्टि करें।"
        : "इस संदेश में तेज़ घोटाले के संकेत नहीं दिखे।";

  const safeAction =
    level === "safe"
      ? "No urgent action needed. If unsure, call the person on their saved contact number."
      : "Do not pay or share OTP. Call them on the number already saved in your phone — not this chat.";

  const safeActionHi =
    level === "safe"
      ? "तुरंत कुछ करने की ज़रूरत नहीं। संदेह हो तो सेव किए नंबर पर कॉल करें।"
      : "पैसे या OTP न भेजें। फोन में सेव नंबर पर कॉल करें — इस चैट पर नहीं।";

  const replyEn =
    level === "safe"
      ? "Thanks for the message. I'll reply properly in a bit."
      : "I won't send money or OTP on chat. I'm calling your saved number now to verify.";

  const replyHi =
    level === "safe"
      ? "धन्यवाद, मैं थोड़ी देर में सही से जवाब दूँगा/दूँगी।"
      : "मैं चैट पर पैसे या OTP नहीं भेजूँगा/भेजूँगी। मैं अभी आपके सेव किए नंबर पर कॉल करके पुष्टि कर रहा/रही हूँ।";

  return {
    level,
    score,
    intent,
    intentHi,
    safeAction,
    safeActionHi,
    replyEn,
    replyHi,
    spokenLineEn:
      level === "safe"
        ? "This message looks okay, but always verify if something feels odd."
        : "Stop. Do not pay on chat. Call the family member on the old saved number first.",
    spokenLineHi:
      level === "safe"
        ? "यह संदेश ठीक लग रहा है, लेकिन अगर कुछ अजीब लगे तो पुष्टि कर लें।"
        : "रुको। चैट पर पैसे मत भेजो। पहले परिवार के सेव नंबर पर कॉल करके पुष्टि करो।",
    evidence,
    ruleHits,
    sourceText: text,
    analyzedBy: "rules",
  };
}
