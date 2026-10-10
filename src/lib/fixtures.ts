import type { Verdict } from "./types";

export interface DemoFixture {
  id: string;
  title: string;
  channel: "WhatsApp" | "SMS" | "Email";
  text: string;
  verdict: Verdict;
}

const fixtures: DemoFixture[] = [
  {
    id: "family-upi",
    title: "Son — new number, don't call",
    channel: "WhatsApp",
    text: `Maa, yeh mera naya number hai. Mera phone kho gaya.
Abhi ₹8,000 chahiye fees ke liye. UPI: rahul.help@paytm
Please turant bhej do. Don't call, network weak hai.`,
    verdict: {
      level: "stop",
      score: 92,
      intent: "Wants an urgent UPI transfer while blocking a phone call to verify identity.",
      intentHi:
        "फोन पर पुष्टि रोककर तुरंत UPI पर पैसे भेजवाना चाहता है।",
      safeAction:
        "Do not pay. Call your son on the number saved in your phone — not this chat.",
      safeActionHi:
        "पैसे न भेजें। बेटे को फोन में सेव नंबर पर कॉल करें — इस चैट पर नहीं।",
      replyEn:
        "I won't send money on a new number. I'm calling your old saved number now.",
      replyHi:
        "मैं नए नंबर पर पैसे नहीं भेजूँगी। मैं अभी तुम्हारे पुराने सेव नंबर पर कॉल कर रही हूँ।",
      spokenLineEn:
        "Maa, stop. This is a classic family impersonation scam. Call Rahul on his old number before sending anything.",
      spokenLineHi:
        "माँ, रुको। यह परिवार वाला घोटाला हो सकता है। पैसे भेजने से पहले राहुल के पुराने नंबर पर कॉल करो।",
      evidence: [
        {
          quote: "Don't call",
          reason: "Blocks verification by phone",
        },
        {
          quote: "rahul.help@paytm",
          reason: "Unknown UPI handle",
        },
        {
          quote: "₹8,000",
          reason: "Urgent money demand",
        },
        {
          quote: "naya number",
          reason: "New number impersonation",
        },
      ],
      ruleHits: [],
      sourceText: "",
      analyzedBy: "fixture",
    },
  },
  {
    id: "otp-bank",
    title: "Bank OTP trap",
    channel: "SMS",
    text: `Dear Customer, your SBI account will be blocked in 2 hours.
Share OTP sent to your mobile to 9876543210 immediately.
Call not required. Reply YES to confirm.`,
    verdict: {
      level: "stop",
      score: 88,
      intent: "Wants your OTP to take over banking access.",
      intentHi: "आपका OTP लेकर बैंक खाते पर कब्ज़ा करना चाहता है।",
      safeAction: "Never share OTP. Open your bank app or call the number on your debit card.",
      safeActionHi:
        "OTP कभी साझा न करें। बैंक ऐप खोलें या डेबिट कार्ड पर दिए नंबर पर कॉल करें।",
      replyEn: "I do not share OTP with anyone. I will contact the bank directly.",
      replyHi: "मैं OTP किसी के साथ साझा नहीं करता/करती। मैं सीधे बैंक से संपर्क करूँगा/करूँगी।",
      spokenLineEn: "Banks never ask for OTP over SMS. Delete this and call your bank's official number.",
      spokenLineHi: "बैंक SMS पर OTP नहीं माँगता। इसे हटाएँ और बैंक के आधिकारिक नंबर पर कॉल करें।",
      evidence: [
        { quote: "Share OTP", reason: "OTP must never be shared" },
        { quote: "blocked in 2 hours", reason: "Artificial urgency" },
      ],
      ruleHits: [],
      sourceText: "",
      analyzedBy: "fixture",
    },
  },
  {
    id: "kyc-link",
    title: "Fake KYC link",
    channel: "SMS",
    text: `Aadhaar KYC pending. Complete within 24 hours or SIM will be deactivated.
Click: bit.ly/kyc-update-now
Do not ignore.`,
    verdict: {
      level: "stop",
      score: 76,
      intent: "Wants you to open a phishing link disguised as KYC.",
      intentHi: "KYC के नाम पर फ़िशिंग लिंक खोलवाना चाहता है।",
      safeAction: "Do not click. Use the official app or telecom store — never a random link.",
      safeActionHi:
        "लिंक न खोलें। केवल आधिकारिक ऐप या टेलीकॉम स्टोर का उपयोग करें।",
      replyEn: "I will complete KYC only through the official app or store.",
      replyHi: "मैं KYC केवल आधिकारिक ऐप या स्टोर से करूँगा/करूँगी।",
      spokenLineEn: "Short links for KYC are almost always fake. Use the official provider app only.",
      spokenLineHi: "KYC के लिए छोटे लिंक आमतौर पर नकली होते हैं। केवल आधिकारिक ऐप का उपयोग करें।",
      evidence: [
        { quote: "bit.ly/kyc-update-now", reason: "Suspicious shortened link" },
        { quote: "within 24 hours", reason: "Pressure deadline" },
      ],
      ruleHits: [],
      sourceText: "",
      analyzedBy: "fixture",
    },
  },
  {
    id: "job-fee",
    title: "Job offer + registration fee",
    channel: "WhatsApp",
    text: `Congratulations! You are selected for WFH data entry.
Pay registration fee ₹499 via UPI jobs@oksbi to start today.
Limited slots. Pay within 1 hour.`,
    verdict: {
      level: "stop",
      score: 81,
      intent: "Wants upfront payment for a fake job offer.",
      intentHi: "नकली नौकरी के लिए पहले से पैसे माँग रहा है।",
      safeAction: "Legitimate jobs do not ask for registration fees on UPI. Ignore and report.",
      safeActionHi:
        "असली नौकरी UPI पर रजिस्ट्रेशन फीस नहीं माँगती। अनदेखा करें और रिपोर्ट करें।",
      replyEn: "I don't pay fees for job offers. Please share official company email only.",
      replyHi: "मैं नौकरी के लिए फीस नहीं देता/देती। कृपया केवल आधिकारिक कंपनी ईमेल भेजें।",
      spokenLineEn: "Real employers don't ask for UPI fees on WhatsApp. This is a job scam.",
      spokenLineHi: "असली नियोक्ता WhatsApp पर UPI फीस नहीं माँगते। यह नौकरी घोटाला है।",
      evidence: [
        { quote: "jobs@oksbi", reason: "Payment to personal UPI" },
        { quote: "₹499", reason: "Upfront fee" },
        { quote: "within 1 hour", reason: "Urgency" },
      ],
      ruleHits: [],
      sourceText: "",
      analyzedBy: "fixture",
    },
  },
  {
    id: "parcel",
    title: "Courier customs fee",
    channel: "SMS",
    text: `India Post: Your parcel is held. Pay customs ₹120 at http://indiapost-fee.in
Failure to pay in 6 hours leads to return.`,
    verdict: {
      level: "caution",
      score: 48,
      intent: "May be phishing — verify parcel on the official India Post site.",
      intentHi: "फ़िशिंग हो सकता है — केवल आधिकारिक India Post साइट पर जाँच करें।",
      safeAction: "Check tracking only on indiapost.gov.in. Do not pay via random links.",
      safeActionHi:
        "ट्रैकिंग केवल indiapost.gov.in पर देखें। अजीब लिंक से भुगतान न करें।",
      replyEn: "I'll verify on the official India Post website first.",
      replyHi: "मैं पहले आधिकारिक India Post वेबसाइट पर जाँच करूँगा/करूँगी।",
      spokenLineEn: "If you weren't expecting a parcel, treat this as suspicious and verify officially.",
      spokenLineHi: "अगर आप पार्सल की उम्मीद नहीं कर रहे थे, तो इसे संदिग्ध मानें और आधिकारिक रूप से जाँचें।",
      evidence: [
        { quote: "indiapost-fee.in", reason: "Unofficial domain" },
        { quote: "6 hours", reason: "Urgency" },
      ],
      ruleHits: [],
      sourceText: "",
      analyzedBy: "fixture",
    },
  },
  {
    id: "safe-family",
    title: "Safe — real family check-in",
    channel: "WhatsApp",
    text: `Papa, reached hostel safely. Dinner done.
Will call you tomorrow morning from my regular number.
No need to send money — fees already paid.`,
    verdict: {
      level: "safe",
      score: 12,
      intent: "Normal family update with no payment or OTP request.",
      intentHi: "सामान्य परिवार संदेश — न पैसे की माँग, न OTP।",
      safeAction: "Looks fine. You can reply normally or call tomorrow as they said.",
      safeActionHi:
        "ठीक लगता है। सामान्य जवाब दें या कल जैसा कहा है कॉल करें।",
      replyEn: "Good to hear you're safe. Call me tomorrow morning.",
      replyHi: "अच्छा लगा कि तुम सुरक्षित पहुँच गए। कल सुबह कॉल करना।",
      spokenLineEn: "This reads like a genuine check-in — no money pressure or OTP ask.",
      spokenLineHi: "यह सामान्य संदेश लगता है — न पैसे की माँग, न OTP।",
      evidence: [],
      ruleHits: [],
      sourceText: "",
      analyzedBy: "fixture",
    },
  },
];

for (const f of fixtures) {
  f.verdict.sourceText = f.text;
}

export function getFixture(id: string): DemoFixture | undefined {
  return fixtures.find((f) => f.id === id);
}

export function listFixtures(): DemoFixture[] {
  return fixtures;
}
