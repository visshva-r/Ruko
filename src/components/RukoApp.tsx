"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Verdict } from "@/lib/types";
import { listFixtures } from "@/lib/fixtures";
import { t, type Lang } from "@/lib/ui-copy";
import { VerdictPanel } from "./VerdictPanel";

export function RukoApp() {
  const [text, setText] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fixtures = listFixtures();

  const runAnalyze = useCallback(async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Analysis failed");
        setVerdict(null);
        return;
      }
      setVerdict(data.verdict as Verdict);
    } catch {
      setError(t(lang, "networkError"));
      setVerdict(null);
    } finally {
      setLoading(false);
    }
  }, [lang]);

  const onAnalyzeText = () => {
    if (!text.trim()) {
      setError(t(lang, "emptyError"));
      return;
    }
    runAnalyze({ text });
  };

  const onFixture = (id: string, fixtureText: string) => {
    setText(fixtureText);
    runAnalyze({ fixtureId: id });
  };

  const onFile = async (file: File) => {
    const buf = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buf).reduce((s, b) => s + String.fromCharCode(b), ""),
    );
    const mime = file.type || "image/png";
    runAnalyze({ text: text.trim() || undefined, imageBase64: base64, imageMimeType: mime });
  };

  const stopSpeak = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = () => {
    if (!verdict || typeof window === "undefined") return;
    const line = lang === "hi" ? verdict.spokenLineHi : verdict.spokenLineEn;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(line);
    u.lang = lang === "hi" ? "hi-IN" : "en-IN";
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    return () => {
      stopSpeak();
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, [stopSpeak]);

  const copyReply = async () => {
    if (!verdict) return;
    const line = lang === "hi" ? verdict.replyHi : verdict.replyEn;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 4500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-400">
          {t(lang, "tagline")}
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          RUKO
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-300">{t(lang, "hero")}</p>
      </header>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            lang === "en" ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-300"
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLang("hi")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            lang === "hi" ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-300"
          }`}
        >
          हिंदी
        </button>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <label className="text-sm font-semibold text-slate-200">{t(lang, "messageLabel")}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t(lang, "messagePlaceholder")}
            rows={8}
            className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={onAnalyzeText}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
            >
              {loading ? t(lang, "checking") : t(lang, "checkMessage")}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border border-white/15 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-700"
            >
              {t(lang, "uploadScreenshot")}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
            />
            {verdict && (
              <button
                type="button"
                onClick={copyReply}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  copied
                    ? "border-emerald-500/50 bg-emerald-950/50 text-emerald-300"
                    : "border-white/15 text-slate-200 hover:bg-slate-800"
                }`}
              >
                {copied ? t(lang, "copied") : t(lang, "copyReply")}
              </button>
            )}
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t(lang, "demoHeading")}
            </p>
            <div className="flex flex-col gap-2">
              {fixtures.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onFixture(f.id, f.text)}
                  className="rounded-lg border border-white/5 bg-slate-950/50 px-3 py-2 text-left text-sm text-slate-300 hover:border-teal-500/40 hover:text-white"
                >
                  <span className="font-medium text-slate-100">{f.title}</span>
                  <span className="ml-2 text-xs text-slate-500">{f.channel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {verdict ? (
            <VerdictPanel
              verdict={verdict}
              lang={lang}
              onSpeak={speak}
              onStopSpeak={stopSpeak}
              speaking={speaking}
            />
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-slate-900/30 p-8 text-center text-slate-400">
              {t(lang, "emptyState")}
            </div>
          )}
        </div>
      </section>

      <footer className="text-center text-xs text-slate-500">{t(lang, "footer")}</footer>
    </div>
  );
}
