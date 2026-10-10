# RUKO — Stop scams before you pay

**HackNowa Global Hackathon 2026** · Problem statement: **Digital Safety & Cybersecurity**

RUKO helps families decide what to do when a suspicious WhatsApp, SMS, or email arrives. Paste text or upload a screenshot. Get **Stop**, **Caution**, or **Safe**, with quoted evidence on the message, one safe action, and paste-ready replies in **English** and **Hindi**.

## Live demo

Deploy to Vercel (see below) and add the URL to your Unstop submission.

## How judges map to criteria

| Criterion | How RUKO addresses it |
|-----------|------------------------|
| **Innovation & originality** | Hybrid **rules + LLM** with evidence highlights on the original message, tuned for Indian UPI / OTP / “don't call” family scams — not a generic chatbot. |
| **AI / technical implementation** | Deterministic rule engine (`src/lib/rules.ts`) + **Gemini** JSON verdict and vision OCR (`src/lib/gemini.ts`), merged in `src/lib/merge-verdict.ts`. |
| **Problem relevance & impact** | Targets impersonation and payment fraud that affects households daily; bilingual guidance for parents. |
| **Functionality** | Six built-in demo cases work without API; live analysis with optional `GEMINI_API_KEY`; screenshot upload; speech via Web Speech API. |
| **Presentation & demo** | Single-screen flow; see [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for a 90-second video outline. |

## Quick start

```bash
cd Project
npm install
cp .env.example .env.local   # optional: add GEMINI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Without an API key:** demo cases and the rule engine still work. **With Gemini:** pasted text and screenshots use the hybrid path.

## Deploy (Vercel)

1. Push this `Project` folder to GitHub (repo root can be `Project` or monorepo with `Project` as root).
2. Import in [Vercel](https://vercel.com/new).
3. Set environment variable: `GEMINI_API_KEY` (Project Settings → Environment Variables).
4. Deploy.

## Project structure

```
src/
  app/api/analyze/route.ts   # Analysis API
  components/RukoApp.tsx     # Main UI
  lib/rules.ts               # UPI, OTP, urgency, links
  lib/fixtures.ts            # Six demo scenarios
  lib/gemini.ts              # Gemini structured verdict + OCR
```

## Privacy

Messages are processed for analysis only; this MVP does not persist user content in a database.

## Author

Solo submission — HackNowa Global Hackathon 2026, Innovation Hacks.
