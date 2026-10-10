export type Lang = "en" | "hi";

const copy = {
  en: {
    tagline: "HackNowa 2026 · Digital Safety",
    hero:
      "Paste a WhatsApp, SMS, or email. RUKO shows Stop, Caution, or Safe — with proof on the message, one safe action, and a reply in English or Hindi.",
    messageLabel: "Message text",
    messagePlaceholder: "Paste suspicious message here…",
    checkMessage: "Check message",
    checking: "Checking…",
    uploadScreenshot: "Upload screenshot",
    copyReply: "Copy reply",
    copied: "Copied!",
    demoHeading: "Demo cases (reliable for video)",
    emptyError: "Paste a message or pick a demo case.",
    networkError: "Network error. Try a demo case — they work offline.",
    emptyState: "Run a check or tap Son — new number for the demo scam.",
    footer: "Hybrid checks: rule signals + Gemini AI. Your message is not stored.",
    riskScore: "Risk score",
    safeAction: "Safe action",
    messageEvidence: "Message with evidence",
    replyPaste: "Reply to paste",
    forParents: "For parents (spoken)",
    listen: "Listen",
    speaking: "Speaking…",
    stopAudio: "Stop",
    analysisHybrid: "Checked with rules + Gemini AI",
    analysisRules: "Checked with safety rules",
    analysisFixture: "Demo case (saved example)",
  },
  hi: {
    tagline: "HackNowa 2026 · डिजिटल सुरक्षा",
    hero:
      "WhatsApp, SMS या ईमेल चिपकाएँ। RUKO Stop, Caution या Safe दिखाता है — संदेश पर सबूत, एक सुरक्षित कदम, और हिंदी/अंग्रेज़ी में जवाब।",
    messageLabel: "संदेश",
    messagePlaceholder: "संदिग्ध संदेश यहाँ चिपकाएँ…",
    checkMessage: "संदेश जाँचें",
    checking: "जाँच हो रही है…",
    uploadScreenshot: "स्क्रीनशॉट अपलोड करें",
    copyReply: "जवाब कॉपी करें",
    copied: "कॉपी हो गया!",
    demoHeading: "डेमो केस (वीडियो के लिए भरोसेमंद)",
    emptyError: "संदेश चिपकाएँ या डेमो केस चुनें।",
    networkError: "नेटवर्क त्रुटि। डेमो केस आज़माएँ।",
    emptyState: "जाँच चलाएँ या डेमो Son — new number चुनें।",
    footer: "नियम + Gemini AI से जाँच। आपका संदेश सेव नहीं होता।",
    riskScore: "जोखिम स्कोर",
    safeAction: "सुरक्षित कदम",
    messageEvidence: "सबूत के साथ संदेश",
    replyPaste: "चिपकाने के लिए जवाब",
    forParents: "माता-पिता के लिए (बोलकर)",
    listen: "सुनें",
    speaking: "बोल रहा है…",
    stopAudio: "रोकें",
    analysisHybrid: "नियम + Gemini AI से जाँच",
    analysisRules: "सुरक्षा नियमों से जाँच",
    analysisFixture: "डेमो उदाहरण",
  },
} as const;

export function t(lang: Lang, key: keyof (typeof copy)["en"]): string {
  return copy[lang][key];
}
