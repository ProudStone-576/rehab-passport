import type { Exercise, Lang, PassportItem } from "./types";

// Patient-facing text only (printed passport + phone pages).
// The clinician screens stay in English.
const en = {
  brand: "REHAB PASSPORT",
  subtitle: "Your home exercise plan",
  patient: "Patient",
  therapist: "Therapist",
  clinic: "Clinic",
  phone: "Phone",
  planVersion: "Plan version",
  started: "started",
  nextReview: "Next visit",
  howTo: "How to use your passport",
  how1: ["Do", "each exercise as shown on its page — the amount is set for you."],
  how2: ["Tick", "the box for each day you complete it. Leave it empty if you did not."],
  how3: ["Watch", "(optional): scan a QR code with a phone camera to see a short video."],
  how4: ["Bring", "this passport to every physiotherapy visit."],
  stopTitle: "STOP and contact your therapist",
  stopBody:
    "if you feel sharp or worsening pain, dizziness, chest pain, breathlessness or new swelling. In an emergency, call your local emergency number.",
  phoneQr: "Optional: scan to open your passport on a phone",
  myExercises: "My exercises",
  dose: "How much",
  precautions: "Precautions",
  dailyLog: "Daily log — tick when done",
  clinicianReview: "Clinician review",
  painLog: "Daily pain score — write a number each day",
  painHelp: "0 = no pain · 10 = worst pain imaginable. If it is 7 or more, contact your therapist.",
  painToday: "How much pain today?",
  painNone: "No pain",
  painWorst: "Worst",
  painHigh: "That is a lot of pain. Stop the exercises and contact your therapist.",
  nextVisitIn: "Next visit",
  daysLeft: "days left",
  visitToday: "Your visit is today",
  overdue: "Your visit date has passed — please contact your therapist",
  periodProgress: "Exercises done since your last visit",
  listen: "Listen",
  stop: "■ Stop",
  noVoice: "Punjabi voice is not available on this phone — reading in English.",
  offline: "Could not save — check your internet and try again.",
  animTitle: "Watch the movement",
  rep: "Rep",
  phStart: "Start position",
  phMove: "Move slowly",
  phHold: "Hold",
  phReturn: "Return slowly",
  slowSpeed: "Slower",
  normalSpeed: "Normal speed",
  pause: "Pause",
  play: "Play",
  realVideo: "Video of a real person",
  scanVideo: "Scan for video",
  scanSteps: "Scan for steps",
  feedback: "Your feedback",
  feedbackSub: "bring to your next visit",
  q1: "1. How easy was this passport to use?",
  q1o: ["Very hard", "Hard", "OK", "Easy", "Very easy"],
  q2: "2. Did you understand the exercise instructions?",
  q2o: ["Yes", "Partly", "No"],
  q3: "3. Did you use the QR videos?",
  q3o: ["Yes, often", "Once or twice", "No", "No smartphone"],
  q4: "4. Anything that was difficult or confusing?",
  footer: "Rehab Passport — prototype. Exercises prescribed by your treating therapist only.",
  // phone pages
  yourDose: "Your amount",
  howToDo: "How to do it",
  noteFrom: "Note from your therapist:",
  noVideo: "No video for this exercise — follow the pictures and steps below.",
  watch: "Watch demonstration video",
  videoCredit: "Video:",
  rememberTick: "Remember to tick today's box in your paper passport.",
  badLink: "Link not recognised",
  badLinkBody: "Please scan the QR code in your passport again, or follow the printed instructions.",
  today: "Today",
  done: "Done",
  markDone: "Mark done",
  allDone: "All of today's exercises are done. Well done!",
  thisWeek: "This week",
  daysActive: "days with all exercises done",
  showSteps: "Show steps",
  hideSteps: "Hide steps",
  callTherapist: "Call your therapist",
  start: "Start",
  end: "End",
};

type Dict = typeof en;

const pa: Dict = {
  brand: "ਰੀਹੈਬ ਪਾਸਪੋਰਟ",
  subtitle: "ਤੁਹਾਡੀ ਘਰੇਲੂ ਕਸਰਤ ਯੋਜਨਾ",
  patient: "ਮਰੀਜ਼",
  therapist: "ਥੈਰੇਪਿਸਟ",
  clinic: "ਕਲੀਨਿਕ",
  phone: "ਫ਼ੋਨ",
  planVersion: "ਯੋਜਨਾ ਵਰਜ਼ਨ",
  started: "ਸ਼ੁਰੂ",
  nextReview: "ਅਗਲੀ ਮੁਲਾਕਾਤ",
  howTo: "ਆਪਣਾ ਪਾਸਪੋਰਟ ਕਿਵੇਂ ਵਰਤਣਾ ਹੈ",
  how1: ["ਕਰੋ:", "ਹਰ ਕਸਰਤ ਉਸੇ ਤਰ੍ਹਾਂ ਕਰੋ ਜਿਵੇਂ ਉਸਦੇ ਪੰਨੇ 'ਤੇ ਦਿਖਾਇਆ ਹੈ — ਗਿਣਤੀ ਤੁਹਾਡੇ ਲਈ ਤੈਅ ਕੀਤੀ ਗਈ ਹੈ।"],
  how2: ["✓ ਲਗਾਓ:", "ਜਿਸ ਦਿਨ ਕਸਰਤ ਪੂਰੀ ਕਰੋ, ਉਸ ਦਿਨ ਦੇ ਖਾਨੇ ਵਿੱਚ ✓ ਲਗਾਓ। ਜੇ ਨਹੀਂ ਕੀਤੀ ਤਾਂ ਖਾਨਾ ਖਾਲੀ ਛੱਡੋ।"],
  how3: ["ਦੇਖੋ:", "(ਜ਼ਰੂਰੀ ਨਹੀਂ) ਛੋਟੀ ਵੀਡੀਓ ਦੇਖਣ ਲਈ ਫ਼ੋਨ ਦੇ ਕੈਮਰੇ ਨਾਲ QR ਕੋਡ ਸਕੈਨ ਕਰੋ।"],
  how4: ["ਲਿਆਓ:", "ਹਰ ਫਿਜ਼ੀਓਥੈਰੇਪੀ ਮੁਲਾਕਾਤ 'ਤੇ ਇਹ ਪਾਸਪੋਰਟ ਨਾਲ ਲਿਆਓ।"],
  stopTitle: "ਰੁਕੋ ਅਤੇ ਆਪਣੇ ਥੈਰੇਪਿਸਟ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
  stopBody:
    "ਜੇ ਤੁਹਾਨੂੰ ਤੇਜ਼ ਜਾਂ ਵਧਦਾ ਦਰਦ, ਚੱਕਰ, ਛਾਤੀ ਵਿੱਚ ਦਰਦ, ਸਾਹ ਚੜ੍ਹਨਾ ਜਾਂ ਨਵੀਂ ਸੋਜ ਮਹਿਸੂਸ ਹੋਵੇ। ਐਮਰਜੈਂਸੀ ਵਿੱਚ ਆਪਣੇ ਸਥਾਨਕ ਐਮਰਜੈਂਸੀ ਨੰਬਰ 'ਤੇ ਕਾਲ ਕਰੋ।",
  phoneQr: "ਜ਼ਰੂਰੀ ਨਹੀਂ: ਫ਼ੋਨ 'ਤੇ ਆਪਣਾ ਪਾਸਪੋਰਟ ਖੋਲ੍ਹਣ ਲਈ ਸਕੈਨ ਕਰੋ",
  myExercises: "ਮੇਰੀਆਂ ਕਸਰਤਾਂ",
  dose: "ਕਿੰਨੀ ਵਾਰ",
  precautions: "ਸਾਵਧਾਨੀਆਂ",
  dailyLog: "ਰੋਜ਼ਾਨਾ ਰਿਕਾਰਡ — ਕਰਨ ਤੋਂ ਬਾਅਦ ✓ ਲਗਾਓ",
  clinicianReview: "ਥੈਰੇਪਿਸਟ ਦੀ ਜਾਂਚ",
  painLog: "ਰੋਜ਼ਾਨਾ ਦਰਦ ਅੰਕ — ਹਰ ਰੋਜ਼ ਇੱਕ ਨੰਬਰ ਲਿਖੋ",
  painHelp: "0 = ਕੋਈ ਦਰਦ ਨਹੀਂ · 10 = ਸਭ ਤੋਂ ਵੱਧ ਦਰਦ। ਜੇ 7 ਜਾਂ ਵੱਧ ਹੋਵੇ ਤਾਂ ਆਪਣੇ ਥੈਰੇਪਿਸਟ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
  painToday: "ਅੱਜ ਕਿੰਨਾ ਦਰਦ ਹੈ?",
  painNone: "ਕੋਈ ਦਰਦ ਨਹੀਂ",
  painWorst: "ਸਭ ਤੋਂ ਵੱਧ",
  painHigh: "ਇਹ ਬਹੁਤ ਜ਼ਿਆਦਾ ਦਰਦ ਹੈ। ਕਸਰਤਾਂ ਰੋਕੋ ਅਤੇ ਆਪਣੇ ਥੈਰੇਪਿਸਟ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
  nextVisitIn: "ਅਗਲੀ ਮੁਲਾਕਾਤ",
  daysLeft: "ਦਿਨ ਬਾਕੀ",
  visitToday: "ਤੁਹਾਡੀ ਮੁਲਾਕਾਤ ਅੱਜ ਹੈ",
  overdue: "ਤੁਹਾਡੀ ਮੁਲਾਕਾਤ ਦੀ ਤਾਰੀਖ਼ ਲੰਘ ਗਈ ਹੈ — ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਥੈਰੇਪਿਸਟ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
  periodProgress: "ਪਿਛਲੀ ਮੁਲਾਕਾਤ ਤੋਂ ਬਾਅਦ ਕੀਤੀਆਂ ਕਸਰਤਾਂ",
  listen: "ਸੁਣੋ",
  stop: "■ ਰੋਕੋ",
  noVoice: "ਇਸ ਫ਼ੋਨ 'ਤੇ ਪੰਜਾਬੀ ਆਵਾਜ਼ ਉਪਲਬਧ ਨਹੀਂ — ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਪੜ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ।",
  offline: "ਸੰਭਾਲਿਆ ਨਹੀਂ ਜਾ ਸਕਿਆ — ਇੰਟਰਨੈੱਟ ਦੇਖੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  animTitle: "ਹਰਕਤ ਦੇਖੋ",
  rep: "ਵਾਰ",
  phStart: "ਸ਼ੁਰੂ ਦੀ ਸਥਿਤੀ",
  phMove: "ਹੌਲੀ-ਹੌਲੀ ਕਰੋ",
  phHold: "ਰੋਕ ਕੇ ਰੱਖੋ",
  phReturn: "ਹੌਲੀ-ਹੌਲੀ ਵਾਪਸ ਆਓ",
  slowSpeed: "ਹੋਰ ਹੌਲੀ",
  normalSpeed: "ਆਮ ਰਫ਼ਤਾਰ",
  pause: "ਰੋਕੋ",
  play: "ਚਲਾਓ",
  realVideo: "ਅਸਲ ਵਿਅਕਤੀ ਦੀ ਵੀਡੀਓ",
  scanVideo: "ਵੀਡੀਓ ਲਈ ਸਕੈਨ ਕਰੋ",
  scanSteps: "ਤਰੀਕੇ ਲਈ ਸਕੈਨ ਕਰੋ",
  feedback: "ਤੁਹਾਡੀ ਰਾਏ",
  feedbackSub: "ਅਗਲੀ ਮੁਲਾਕਾਤ 'ਤੇ ਨਾਲ ਲਿਆਓ",
  q1: "1. ਇਹ ਪਾਸਪੋਰਟ ਵਰਤਣਾ ਕਿੰਨਾ ਆਸਾਨ ਸੀ?",
  q1o: ["ਬਹੁਤ ਔਖਾ", "ਔਖਾ", "ਠੀਕ", "ਆਸਾਨ", "ਬਹੁਤ ਆਸਾਨ"],
  q2: "2. ਕੀ ਤੁਹਾਨੂੰ ਕਸਰਤ ਦੀਆਂ ਹਦਾਇਤਾਂ ਸਮਝ ਆਈਆਂ?",
  q2o: ["ਹਾਂ", "ਕੁਝ ਹੱਦ ਤੱਕ", "ਨਹੀਂ"],
  q3: "3. ਕੀ ਤੁਸੀਂ QR ਵੀਡੀਓ ਦੇਖੀਆਂ?",
  q3o: ["ਹਾਂ, ਅਕਸਰ", "ਇੱਕ-ਦੋ ਵਾਰ", "ਨਹੀਂ", "ਸਮਾਰਟਫ਼ੋਨ ਨਹੀਂ ਹੈ"],
  q4: "4. ਕੀ ਕੁਝ ਔਖਾ ਜਾਂ ਸਮਝਣ ਵਿੱਚ ਮੁਸ਼ਕਲ ਸੀ?",
  footer: "ਰੀਹੈਬ ਪਾਸਪੋਰਟ — ਪ੍ਰੋਟੋਟਾਈਪ। ਕਸਰਤਾਂ ਸਿਰਫ਼ ਤੁਹਾਡੇ ਇਲਾਜ ਕਰ ਰਹੇ ਥੈਰੇਪਿਸਟ ਵੱਲੋਂ ਦੱਸੀਆਂ ਗਈਆਂ ਹਨ।",
  yourDose: "ਤੁਹਾਡੀ ਗਿਣਤੀ",
  howToDo: "ਕਿਵੇਂ ਕਰਨੀ ਹੈ",
  noteFrom: "ਥੈਰੇਪਿਸਟ ਵੱਲੋਂ ਨੋਟ:",
  noVideo: "ਇਸ ਕਸਰਤ ਲਈ ਵੀਡੀਓ ਨਹੀਂ ਹੈ — ਹੇਠਾਂ ਦਿੱਤੀਆਂ ਤਸਵੀਰਾਂ ਅਤੇ ਤਰੀਕਾ ਦੇਖੋ।",
  watch: "ਵੀਡੀਓ ਦੇਖੋ",
  videoCredit: "ਵੀਡੀਓ:",
  rememberTick: "ਆਪਣੇ ਕਾਗਜ਼ੀ ਪਾਸਪੋਰਟ ਵਿੱਚ ਅੱਜ ਦਾ ਖਾਨਾ ✓ ਕਰਨਾ ਯਾਦ ਰੱਖੋ।",
  badLink: "ਲਿੰਕ ਪਛਾਣਿਆ ਨਹੀਂ ਗਿਆ",
  badLinkBody: "ਕਿਰਪਾ ਕਰਕੇ ਪਾਸਪੋਰਟ ਵਿਚਲਾ QR ਕੋਡ ਦੁਬਾਰਾ ਸਕੈਨ ਕਰੋ, ਜਾਂ ਛਪੀਆਂ ਹਦਾਇਤਾਂ ਦੀ ਪਾਲਣਾ ਕਰੋ।",
  today: "ਅੱਜ",
  done: "ਹੋ ਗਈ",
  markDone: "ਪੂਰੀ ਕੀਤੀ",
  allDone: "ਅੱਜ ਦੀਆਂ ਸਾਰੀਆਂ ਕਸਰਤਾਂ ਪੂਰੀਆਂ। ਸ਼ਾਬਾਸ਼!",
  thisWeek: "ਇਹ ਹਫ਼ਤਾ",
  daysActive: "ਦਿਨ ਸਾਰੀਆਂ ਕਸਰਤਾਂ ਪੂਰੀਆਂ",
  showSteps: "ਤਰੀਕਾ ਦੇਖੋ",
  hideSteps: "ਤਰੀਕਾ ਲੁਕਾਓ",
  callTherapist: "ਥੈਰੇਪਿਸਟ ਨੂੰ ਫ਼ੋਨ ਕਰੋ",
  start: "ਸ਼ੁਰੂ",
  end: "ਅੰਤ",
};

export type TKey = keyof Dict;

/** Text for one language ("both" renders English with Punjabi underneath, see `Bi`). */
export function dict(lang: "en" | "pa"): Dict {
  return lang === "pa" ? pa : en;
}

export function langs(lang: Lang): ("en" | "pa")[] {
  return lang === "both" ? ["pa", "en"] : [lang];
}

const PA_DAYS = ["ਐਤਵਾਰ", "ਸੋਮਵਾਰ", "ਮੰਗਲਵਾਰ", "ਬੁੱਧਵਾਰ", "ਵੀਰਵਾਰ", "ਸ਼ੁੱਕਰਵਾਰ", "ਸ਼ਨਿੱਚਰਵਾਰ"];
const PA_DAYS_SHORT = ["ਐਤ", "ਸੋਮ", "ਮੰਗਲ", "ਬੁੱਧ", "ਵੀਰ", "ਸ਼ੁੱਕਰ", "ਸ਼ਨਿੱਚਰ"];
const PA_MONTHS = ["ਜਨਵਰੀ", "ਫ਼ਰਵਰੀ", "ਮਾਰਚ", "ਅਪ੍ਰੈਲ", "ਮਈ", "ਜੂਨ", "ਜੁਲਾਈ", "ਅਗਸਤ", "ਸਤੰਬਰ", "ਅਕਤੂਬਰ", "ਨਵੰਬਰ", "ਦਸੰਬਰ"];

/** Date text without relying on the browser having Punjabi locale data. */
export function fmtDateIn(d: Date, lang: "en" | "pa", style: "weekday" | "short-weekday" | "day-month" | "full" | "long"): string {
  if (lang === "en") {
    const opts: Record<typeof style, Intl.DateTimeFormatOptions> = {
      weekday: { weekday: "long" },
      "short-weekday": { weekday: "short" },
      "day-month": { day: "numeric", month: "long" },
      full: { day: "numeric", month: "long", year: "numeric" },
      long: { weekday: "long", day: "numeric", month: "long" },
    };
    return d.toLocaleDateString("en-GB", opts[style]);
  }
  const day = d.getDate();
  const month = PA_MONTHS[d.getMonth()];
  switch (style) {
    case "weekday": return PA_DAYS[d.getDay()];
    case "short-weekday": return PA_DAYS_SHORT[d.getDay()];
    case "day-month": return `${day} ${month}`;
    case "full": return `${day} ${month} ${d.getFullYear()}`;
    case "long": return `${PA_DAYS[d.getDay()]}, ${day} ${month}`;
  }
}

export function exName(ex: Pick<Exercise, "name" | "pa">, lang: "en" | "pa"): string {
  return lang === "pa" && ex.pa?.name ? ex.pa.name : ex.name;
}

export function exSteps(ex: Pick<Exercise, "steps" | "pa">, lang: "en" | "pa"): string[] {
  return lang === "pa" && ex.pa?.steps.length ? ex.pa.steps : ex.steps;
}

/** Item precautions: if the therapist kept the library default, use its translation. */
export function exPrecautions(ex: Pick<Exercise, "precautions" | "pa">, itemPrecautions: string, lang: "en" | "pa"): string {
  if (lang === "pa" && ex.pa?.precautions && itemPrecautions.trim() === ex.precautions.trim()) return ex.pa.precautions;
  return itemPrecautions;
}

export function doseIn(item: Pick<PassportItem, "sets" | "reps" | "perDay" | "hold">, lang: "en" | "pa"): string {
  if (lang === "en") {
    const base = `${item.sets} set${item.sets === 1 ? "" : "s"} × ${item.reps} reps, ${item.perDay}× a day`;
    return item.hold ? `${base}, ${item.hold}` : base;
  }
  const base = `${item.sets} ਸੈੱਟ × ${item.reps} ਵਾਰ, ਦਿਨ ਵਿੱਚ ${item.perDay} ਵਾਰ`;
  if (!item.hold) return base;
  const m = item.hold.match(/hold\s*(\d+)\s*s/i);
  return `${base}, ${m ? `${m[1]} ਸਕਿੰਟ ਰੋਕੋ` : item.hold}`;
}
