export interface HighlightSpan {
  start: number;
  end: number;
  reason: string;
}

export function buildHighlightSpans(
  text: string,
  quotes: string[],
): HighlightSpan[] {
  const spans: HighlightSpan[] = [];
  const lower = text.toLowerCase();

  for (const quote of quotes) {
    const q = quote.trim();
    if (!q) continue;
    let idx = 0;
    const qLower = q.toLowerCase();
    while (idx < lower.length) {
      const found = lower.indexOf(qLower, idx);
      if (found === -1) break;
      spans.push({ start: found, end: found + q.length, reason: "flagged" });
      idx = found + q.length;
    }
  }

  spans.sort((a, b) => a.start - b.start);
  const merged: HighlightSpan[] = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (last && s.start <= last.end) {
      last.end = Math.max(last.end, s.end);
    } else {
      merged.push({ ...s });
    }
  }
  return merged;
}
