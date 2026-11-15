import { activePassport, addDays, adherence, dateKey, findExercise, nextReviewDate, passportDays, recentMaxPain } from "@/lib/logic";
import type { Data, Passport, Patient } from "@/lib/types";

/** One patient as the dashboard and the patient list see them. Read-only, derived from Data. */
export type PatientRow = {
  pt: Patient;
  p?: Passport;
  week: number | null; // completion % over the last 7 days
  due: string | null; // next visit date
  pain: number | null; // highest pain in the last 3 days
  overdue: boolean;
  highPain: boolean;
};

export function patientRows(data: Data, today = dateKey()): PatientRow[] {
  return data.patients.map((pt) => {
    const p = activePassport(data, pt.id);
    const days = p ? passportDays(p).filter((d) => d > addDays(today, -7)) : [];
    const wk = p ? adherence(p, data.logs, days) : null;
    const due = p ? nextReviewDate(data, p) : null;
    const pain = p ? recentMaxPain(data.pain, p) : null;
    return {
      pt, p, due, pain,
      week: wk?.pct ?? null,
      overdue: !!due && due < today,
      highPain: pain !== null && pain >= 7,
    };
  });
}

export type Activity = { key: string; date: string; patientId: string; code: string; text: string; tag?: { label: string; tone: "" | "warn" | "danger" | "quiet" } };

/** Most recent ticks, pain scores, reviews and feedback, newest first. */
export function recentActivity(data: Data, limit = 8): Activity[] {
  const byPassport = new Map(data.passports.map((p) => [p.id, p]));
  const code = new Map(data.patients.map((pt) => [pt.id, pt.code]));
  const out: Activity[] = [];
  for (const l of data.logs) {
    const p = byPassport.get(l.passportId);
    if (!p || !code.has(p.patientId)) continue;
    const item = p.items.find((i) => i.id === l.itemId);
    const ex = item ? findExercise(data, item.exerciseId) : undefined;
    out.push({
      key: "l" + l.id, date: l.date, patientId: p.patientId, code: code.get(p.patientId)!,
      text: `Did ${ex?.name ?? "an exercise"}`,
      tag: { label: l.source === "phone" ? "from phone" : "paper", tone: l.source === "phone" ? "" : "quiet" },
    });
  }
  for (const s of data.pain) {
    const p = byPassport.get(s.passportId);
    if (!p || !code.has(p.patientId)) continue;
    out.push({
      key: "p" + s.id, date: s.date, patientId: p.patientId, code: code.get(p.patientId)!,
      text: `Pain ${s.score}/10`,
      tag: s.score >= 7 ? { label: "check safety", tone: "danger" } : undefined,
    });
  }
  for (const r of data.reviews) {
    if (!code.has(r.patientId)) continue;
    out.push({ key: "r" + r.id, date: r.date, patientId: r.patientId, code: code.get(r.patientId)!, text: "Follow-up review saved", tag: { label: r.outcome, tone: r.outcome === "modified" ? "warn" : "quiet" } });
  }
  // Newest day first; within a day, pain and reviews before individual ticks.
  const rank = (a: Activity) => (a.key[0] === "l" ? 2 : a.key[0] === "p" ? 0 : 1);
  return out.sort((a, b) => (a.date === b.date ? rank(a) - rank(b) : a.date < b.date ? 1 : -1)).slice(0, limit);
}
