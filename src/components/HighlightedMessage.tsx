"use client";

import type { ReactNode } from "react";
import { buildHighlightSpans } from "@/lib/highlight";

interface Props {
  text: string;
  quotes: string[];
}

export function HighlightedMessage({ text, quotes }: Props) {
  const spans = buildHighlightSpans(text, quotes);

  if (spans.length === 0) {
    return (
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-200">
        {text}
      </pre>
    );
  }

  const parts: ReactNode[] = [];
  let cursor = 0;
  spans.forEach((span, i) => {
    if (cursor < span.start) {
      parts.push(<span key={`t-${i}`}>{text.slice(cursor, span.start)}</span>);
    }
    parts.push(
      <mark
        key={`m-${i}`}
        className="rounded bg-amber-500/35 px-0.5 text-amber-50 ring-1 ring-amber-400/50"
      >
        {text.slice(span.start, span.end)}
      </mark>,
    );
    cursor = span.end;
  });
  if (cursor < text.length) {
    parts.push(<span key="tail">{text.slice(cursor)}</span>);
  }

  return (
    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-200">
      {parts}
    </pre>
  );
}
