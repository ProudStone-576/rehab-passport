import { addDays, dateKey, logId, painId, visitPeriod } from "@/lib/logic";
import { findExercise } from "@/lib/logic";
import type { PhonePost, PhoneView } from "@/lib/phone";
import { query } from "@/lib/server/db";
import { loadData } from "@/lib/server/repo";
import { toShared } from "@/lib/share";
import type { Data, Passport, Patient } from "@/lib/types";

// The patient's phone link /p/<token> is the only credential here: the token
// is a long random secret per patient, and the API only exposes that
// patient's active plan (pseudonymous code, no name or diagnosis).

async function resolve(token: string): Promise<{ data: Data; patient: Patient; passport: Passport; therapistId: string } | null> {
  if (!/^[a-f0-9]{24,64}$/i.test(token)) return null;
  const [row] = await query<{ therapist_id: string }>("SELECT therapist_id FROM patients WHERE phone_token = $1", [token]);
  if (!row) return null;
  const data = await loadData(row.therapist_id);
  const patient = data.patients.find((p) => p.phoneToken === token);
  const passport = patient && data.passports.find((p) => p.patientId === patient.id && p.status === "active");
  return patient && passport ? { data, patient, passport, therapistId: row.therapist_id } : null;
}

const notFound = () => Response.json({ error: "Not found" }, { status: 404 });

export async function GET(_req: Request, ctx: RouteContext<"/api/phone/[token]">) {
  const { token } = await ctx.params;
  const r = await resolve(token);
  if (!r) return notFound();
  const { data, patient, passport: p } = r;
  const period = visitPeriod(data, p);
  const view: PhoneView = {
    code: patient.code,
    lang: patient.language,
    therapist: data.clinic.therapist,
    clinic: data.clinic.clinic,
    phone: data.clinic.phone,
    passportId: p.id,
    version: p.version,
    nextVisit: p.nextVisit,
    visit: period.visit,
    periodStart: period.start,
    periodDays: period.days,
    items: p.items.flatMap((it) => {
      const ex = findExercise(data, it.exerciseId);
      return ex ? [{ ...toShared(it, ex, data.photos[ex.id]), itemId: it.id }] : [];
    }),
    ticks: data.logs.filter((l) => l.passportId === p.id).map((l) => ({ itemId: l.itemId, date: l.date })),
    pain: data.pain.filter((x) => x.passportId === p.id).map((x) => ({ date: x.date, score: x.score })),
  };
  return Response.json(view, { headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request, ctx: RouteContext<"/api/phone/[token]">) {
  const { token } = await ctx.params;
  const r = await resolve(token);
  if (!r) return notFound();
  const { passport: p, therapistId } = r;
  const body = (await req.json().catch(() => null)) as PhonePost | null;
  // The phone sends its own local date; allow one day ahead for time zones.
  const okDate = (d: unknown): d is string =>
    typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= p.startDate && d <= addDays(dateKey(), 1);
  if (!body || !okDate(body.date)) return Response.json({ error: "Bad request" }, { status: 400 });

  if (body.type === "tick") {
    if (!p.items.some((i) => i.id === body.itemId)) return Response.json({ error: "Bad item" }, { status: 400 });
    const id = logId(p.id, body.itemId, body.date);
    if (body.done) {
      await query(
        `INSERT INTO logs (id, therapist_id, passport_id, item_id, date, source) VALUES ($1, $2, $3, $4, $5, 'phone')
         ON CONFLICT (id) DO NOTHING`,
        [id, therapistId, p.id, body.itemId, body.date],
      );
    } else {
      await query("DELETE FROM logs WHERE id = $1 AND therapist_id = $2", [id, therapistId]);
    }
  } else if (body.type === "pain") {
    const id = painId(p.id, body.date);
    if (body.score === null) {
      await query("DELETE FROM pain WHERE id = $1 AND therapist_id = $2", [id, therapistId]);
    } else {
      const score = Number(body.score);
      if (!Number.isInteger(score) || score < 0 || score > 10) return Response.json({ error: "Bad score" }, { status: 400 });
      await query(
        `INSERT INTO pain (id, therapist_id, passport_id, date, score, source) VALUES ($1, $2, $3, $4, $5, 'phone')
         ON CONFLICT (id) DO UPDATE SET score = EXCLUDED.score, source = 'phone' WHERE pain.therapist_id = EXCLUDED.therapist_id`,
        [id, therapistId, p.id, body.date, score],
      );
    }
  } else {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  return Response.json({ ok: true });
}
