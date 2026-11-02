import { BUILTIN_EXERCISES } from "./exercises";
import { addDays, dateKey, logId, newToken, painId, uid } from "./logic";
import type { Data, LogEntry, PainEntry, Passport, PassportItem } from "./types";

function item(exerciseId: string, sets: number, reps: number, perDay: number, hold = ""): PassportItem {
  const ex = BUILTIN_EXERCISES.find((e) => e.id === exerciseId)!;
  return { id: uid(), exerciseId, sets, reps, perDay, hold, precautions: ex.precautions, videoUrl: ex.videoUrl ?? "", notes: "" };
}

// Small deterministic generator so the demo looks the same every reset.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function fakeLogs(p: Passport, days: number, rate: number, seed: number): LogEntry[] {
  const rand = rng(seed);
  const logs: LogEntry[] = [];
  for (let d = 0; d < days; d++) {
    const date = addDays(p.startDate, d);
    for (const it of p.items) {
      if (rand() < rate) logs.push({ id: logId(p.id, it.id, date), passportId: p.id, itemId: it.id, date, source: d % 3 ? "paper" : "phone" });
    }
  }
  return logs;
}

// Pain drifting from `from` to `to` over `days`, reported on most days.
function fakePain(p: Passport, days: number, from: number, to: number, seed: number, spike?: [number, number]): PainEntry[] {
  const rand = rng(seed);
  const out: PainEntry[] = [];
  for (let d = 0; d < days; d++) {
    if (rand() < 0.2) continue;
    const date = addDays(p.startDate, d);
    let score = Math.round(from + ((to - from) * d) / Math.max(1, days - 1) + (rand() - 0.5));
    if (spike && spike[0] === d) score = spike[1];
    out.push({ id: painId(p.id, date), passportId: p.id, date, score: Math.max(0, Math.min(10, score)), source: "phone" });
  }
  return out;
}

export function demoData(): Data {
  const today = dateKey();
  const patients = [
    { id: uid(), code: "P-001", initials: "R.K.", age: 64, condition: "Knee osteoarthritis — home strengthening", language: "both" as const, createdAt: addDays(today, -24), phoneToken: newToken() },
    { id: uid(), code: "P-002", initials: "S.M.", age: 29, condition: "Lateral ankle sprain — return to walking", language: "en" as const, createdAt: addDays(today, -9), phoneToken: newToken() },
    { id: uid(), code: "P-003", initials: "A.D.", age: 47, condition: "Non-specific low back pain", language: "pa" as const, createdAt: addDays(today, -3), phoneToken: newToken() },
  ];

  // P-001 has two versions: v1 was reviewed and modified after 14 days.
  const p1v1: Passport = {
    id: uid(), patientId: patients[0].id, version: 1, startDate: addDays(today, -24), endDate: addDays(today, -10),
    status: "superseded", assessment: "Pain on stairs, reduced quadriceps strength. Independent walker.", setupMinutes: 14,
    nextVisit: `${addDays(today, -10)}T10:00`,
    items: [item("quad-sets", 2, 10, 2, "hold 5 s"), item("straight-leg-raise", 2, 10, 2), item("sit-to-stand", 1, 8, 2)],
  };
  const p1v2: Passport = {
    id: uid(), patientId: patients[0].id, version: 2, startDate: addDays(today, -10), status: "active",
    assessment: "Good adherence to v1. Progressed sit-to-stand, added heel raises.", setupMinutes: 6,
    nextVisit: `${addDays(today, 4)}T10:30`,
    items: [item("straight-leg-raise", 3, 10, 2), item("sit-to-stand", 2, 10, 2), item("heel-raises", 2, 12, 1)],
  };
  const p2: Passport = {
    id: uid(), patientId: patients[1].id, version: 1, startDate: addDays(today, -9), status: "active",
    assessment: "Grade I sprain, weight bearing as tolerated. Mild swelling.", setupMinutes: 11,
    nextVisit: `${addDays(today, 5)}T15:00`,
    items: [item("ankle-pumps", 2, 15, 3), item("heel-raises", 2, 10, 1), item("seated-march", 1, 20, 2)],
  };
  const p3: Passport = {
    id: uid(), patientId: patients[2].id, version: 1, startDate: addDays(today, -3), status: "active",
    assessment: "Low back pain, no red flags on screening. Fear of movement.", setupMinutes: 12,
    nextVisit: `${addDays(today, 11)}T09:15`,
    items: [item("pelvic-tilt", 2, 10, 2, "hold 5 s"), item("bridging", 2, 8, 1), item("clamshell", 2, 10, 1)],
  };

  return {
    clinic: { therapist: "Your name, BPT (III year)", clinic: "Physiotherapy Outpatient Department", phone: "" },
    exercises: [],
    photos: {},
    patients,
    passports: [p1v1, p1v2, p2, p3],
    logs: [
      ...fakeLogs(p1v1, 14, 0.82, 7),
      ...fakeLogs(p1v2, 9, 0.74, 11), // paper for the last couple of days not entered yet
      ...fakeLogs(p2, 8, 0.55, 23),
      ...fakeLogs(p3, 3, 0.9, 31),
    ],
    pain: [
      ...fakePain(p1v1, 14, 6, 4, 5),
      ...fakePain(p1v2, 10, 4, 3, 9),
      ...fakePain(p2, 9, 6, 4, 13, [7, 7]), // flare yesterday: shows the high-pain flag
      ...fakePain(p3, 4, 5, 4, 17),
    ],
    reviews: [
      { id: uid(), patientId: patients[0].id, passportId: p1v1.id, date: addDays(today, -10), minutes: 8, outcome: "modified",
        notes: "Completed most sessions, reports less pain on stairs. Progressed dose, replaced static quads with heel raises." },
      { id: uid(), patientId: patients[1].id, passportId: p2.id, date: addDays(today, -2), minutes: 7, outcome: "continue",
        notes: "Missed evening sessions on work days. Discussed linking exercises to a daily routine." },
    ],
    feedback: [
      { id: uid(), patientId: patients[0].id, passportId: p1v1.id, date: addDays(today, -10), ease: 5, understood: "yes",
        comments: "Ticking boxes reminded me. Did not need the videos after the first week." },
      { id: uid(), patientId: patients[1].id, passportId: p2.id, date: addDays(today, -2), ease: 4, understood: "partly",
        comments: "Video helped for heel raises. Not sure how many times a day at first." },
    ],
  };
}
