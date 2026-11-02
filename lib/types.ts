export type Exercise = {
  id: string;
  name: string;
  area: string;
  steps: string[];
  precautions: string;
  videoUrl?: string;
  videoSource?: string; // channel credit for the default video
  pa?: { name: string; steps: string[]; precautions: string }; // Punjabi (Gurmukhi)
  builtin?: boolean;
};

export type Lang = "en" | "pa" | "both";

export type Patient = {
  id: string;
  code: string; // pseudonymous code shown everywhere, e.g. P-001
  initials: string;
  age?: number;
  condition: string;
  language: Lang; // language of the printed passport and phone pages
  createdAt: string; // YYYY-MM-DD
  phoneToken: string; // secret part of the patient's phone link /p/<token>
};

export type PassportItem = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
  perDay: number;
  hold: string; // e.g. "hold 5 s", may be empty
  precautions: string;
  videoUrl: string;
  notes: string;
};

export type Passport = {
  id: string;
  patientId: string;
  version: number;
  startDate: string;
  endDate?: string; // set when a newer version replaces it
  status: "active" | "superseded";
  assessment: string;
  setupMinutes: number; // clinician time to create this version
  nextVisit?: string; // local "YYYY-MM-DDTHH:mm", set by the therapist
  items: PassportItem[];
};

export type LogSource = "paper" | "phone" | "therapist";

export type LogEntry = {
  id: string; // passportId:itemId:date (see logId)
  passportId: string;
  itemId: string;
  date: string;
  source: LogSource;
};

export type PainEntry = {
  id: string; // passportId:date (see painId)
  passportId: string;
  date: string;
  score: number; // 0 = no pain, 10 = worst imaginable
  source: LogSource;
};

export type Review = {
  id: string;
  patientId: string;
  passportId: string;
  date: string;
  minutes: number;
  outcome: "continue" | "modified" | "discharged";
  notes: string;
};

export type Feedback = {
  id: string;
  patientId: string;
  passportId: string;
  date: string;
  ease: number; // 1-5
  understood: "yes" | "partly" | "no";
  comments: string;
};

export type Clinic = {
  therapist: string;
  clinic: string;
  phone: string;
};

export type Data = {
  clinic: Clinic;
  exercises: Exercise[]; // custom exercises only; built-ins live in code
  photos: Record<string, string[]>; // exerciseId -> therapist photos (compressed JPEG data URLs)
  patients: Patient[];
  passports: Passport[];
  logs: LogEntry[];
  pain: PainEntry[];
  reviews: Review[];
  feedback: Feedback[];
};
