import type { SharedExercise } from "./share";
import type { Lang } from "./types";

// What the patient's phone receives from GET /api/phone/<token>.
export type PhoneView = {
  code: string;
  lang: Lang;
  therapist: string;
  clinic: string;
  phone: string;
  passportId: string;
  version: number;
  nextVisit?: string; // "YYYY-MM-DDTHH:mm"
  visit: string; // date of next visit
  periodStart: string;
  periodDays: string[];
  items: (SharedExercise & { itemId: string })[];
  ticks: { itemId: string; date: string }[];
  pain: { date: string; score: number }[];
};

export type PhonePost =
  | { type: "tick"; itemId: string; date: string; done: boolean }
  | { type: "pain"; date: string; score: number | null };
