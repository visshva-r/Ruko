"use client";

import type { Verdict } from "@/lib/types";
import { t, type Lang } from "@/lib/ui-copy";
import { HighlightedMessage } from "./HighlightedMessage";

const levelStyles = {
  stop: {
    label: "STOP",
    badge: "bg-red-600/90 text-white",
    ring: "ring-red-500/40",
    glow: "shadow-[0_0_40px_-8px_rgba(239,68,68,0.55)]",
  },
  caution: {
    label: "CAUTION",
    badge: "bg-amber-500/90 text-slate-950",
    ring: "ring-amber-400/40",
    glow: "shadow-[0_0_40px_-8px_rgba(245,158,11,0.45)]",
  },
  safe: {
    label: "SAFE",
    badge: "bg-emerald-600/90 text-white",
    ring: "ring-emerald-500/40",
    glow: "shadow-[0_0_40px_-8px_rgba(16,185,129,0.4)]",
  },
};

interface Props {
  verdict: Verdict;
  lang: Lang;
  onSpeak: () => void;
  onStopSpeak: () => void;
  speaking: boolean;
}

function analysisLabel(verdict: Verdict, lang: Lang): string {
  if (verdict.analyzedBy === "fixture") return t(lang, "analysisFixture");
  if (verdict.analyzedBy === "hybrid") return t(lang, "analysisHybrid");
  return t(lang, "analysisRules");
}

export function VerdictPanel({
  verdict,
  lang,
  onSpeak,
  onStopSpeak,
  speaking,
}: Props) {
  const style = levelStyles[verdict.level];
  const quotes = verdict.evidence.map((e) => e.quote);

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-slate-900/80 p-5 ring-1 ${style.ring} ${style.glow}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`rounded-full px-4 py-1.5 text-sm font-bold tracking-wide ${style.badge}`}>
          {style.label}
        </span>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-slate-400">{t(lang, "riskScore")}</p>
          <p className="text-2xl font-semibold tabular-nums text-white">{verdict.score}</p>
        </div>
      </div>

      <p className="mt-4 text-lg font-medium text-white">
        {lang === "hi" ? verdict.intentHi : verdict.intent}
      </p>
      <p className="mt-2 rounded-xl bg-slate-950/60 p-3 text-sm text-slate-200">
        <span className="font-semibold text-teal-300">{t(lang, "safeAction")}: </span>
        {lang === "hi" ? verdict.safeActionHi : verdict.safeAction}
      </p>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t(lang, "messageEvidence")}
        </p>
        <div className="max-h-48 overflow-y-auto rounded-xl border border-white/5 bg-slate-950/50 p-4">
          <HighlightedMessage text={verdict.sourceText} quotes={quotes} />
        </div>
        {verdict.evidence.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
            {verdict.evidence.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-400">•</span>
                <span>
                  <span className="font-medium text-amber-100/90">&quot;{e.quote}&quot;</span>
                  <span className="text-slate-400"> — {e.reason}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {verdict.ruleHits.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {verdict.ruleHits.map((h, i) => (
            <span
              key={`${h.id}-${i}`}
              className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300"
            >
              {h.label}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">{t(lang, "replyPaste")}</p>
          <p className="mt-2 text-sm text-slate-100">
            {lang === "hi" ? verdict.replyHi : verdict.replyEn}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">{t(lang, "forParents")}</p>
          <p className="mt-2 text-sm text-slate-100">
            {lang === "hi" ? verdict.spokenLineHi : verdict.spokenLineEn}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onSpeak}
              disabled={speaking}
              className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
            >
              {speaking ? t(lang, "speaking") : t(lang, "listen")}
            </button>
            {speaking && (
              <button
                type="button"
                onClick={onStopSpeak}
                className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
              >
                {t(lang, "stopAudio")}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">{analysisLabel(verdict, lang)}</p>
    </div>
  );
}
