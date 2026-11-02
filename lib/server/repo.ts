import { KINDS, asChanges, type Changes, type Kind } from "@/lib/diff";
import { demoData } from "@/lib/seed";
import type { Data } from "@/lib/types";
import { query, sql, type Row } from "./db";

// Server-only. Maps the app's camelCase objects to snake_case tables.
// `json` columns hold nested data; key "*" stores the whole object (exercises).
type Col = { key: string; col: string; json?: boolean; optional?: boolean };

const c = (key: string, col = key, extra: Partial<Col> = {}): Col => ({ key, col, ...extra });

const TABLES: Record<Kind, { table: string; cols: Col[] }> = {
  patients: {
    table: "patients",
    cols: [c("id"), c("code"), c("initials"), c("age", "age", { optional: true }), c("condition"), c("language"), c("createdAt", "created_at"), c("phoneToken", "phone_token")],
  },
  passports: {
    table: "passports",
    cols: [
      c("id"), c("patientId", "patient_id"), c("version"), c("startDate", "start_date"), c("endDate", "end_date", { optional: true }),
      c("status"), c("assessment"), c("setupMinutes", "setup_minutes"), c("nextVisit", "next_visit", { optional: true }), c("items", "items", { json: true }),
    ],
  },
  logs: { table: "logs", cols: [c("id"), c("passportId", "passport_id"), c("itemId", "item_id"), c("date"), c("source")] },
  pain: { table: "pain", cols: [c("id"), c("passportId", "passport_id"), c("date"), c("score"), c("source")] },
  reviews: {
    table: "reviews",
    cols: [c("id"), c("patientId", "patient_id"), c("passportId", "passport_id"), c("date"), c("minutes"), c("outcome"), c("notes")],
  },
  feedback: {
    table: "feedback",
    cols: [c("id"), c("patientId", "patient_id"), c("passportId", "passport_id"), c("date"), c("ease"), c("understood"), c("comments")],
  },
  exercises: { table: "exercises", cols: [c("id"), c("*", "data", { json: true })] },
};

function toObject(cols: Col[], row: Row): Record<string, unknown> {
  const whole = cols.find((x) => x.key === "*");
  if (whole) return row[whole.col] as Record<string, unknown>;
  const o: Record<string, unknown> = {};
  for (const col of cols) {
    const v = row[col.col];
    if (v === null || v === undefined) {
      if (!col.optional) o[col.key] = v;
    } else o[col.key] = v;
  }
  return o;
}

type Q = { text: string; params: unknown[] };

function upsertQuery(kind: Kind, therapistId: string, obj: Record<string, unknown>): Q {
  const { table, cols } = TABLES[kind];
  const params: unknown[] = [therapistId];
  const names = ["therapist_id"];
  const values = ["$1"];
  for (const col of cols) {
    const v = col.key === "*" ? obj : obj[col.key];
    params.push(col.json ? JSON.stringify(v) : v ?? null);
    names.push(col.col);
    values.push(`$${params.length}${col.json ? "::jsonb" : ""}`);
  }
  const set = cols.filter((x) => x.col !== "id").map((x) => `${x.col} = EXCLUDED.${x.col}`).join(", ");
  return {
    // The WHERE stops one therapist overwriting another's row with a guessed id.
    text: `INSERT INTO ${table} (${names.join(", ")}) VALUES (${values.join(", ")})
           ON CONFLICT (id) DO UPDATE SET ${set} WHERE ${table}.therapist_id = EXCLUDED.therapist_id`,
    params,
  };
}

async function run(queries: Q[]) {
  if (!queries.length) return;
  const db = sql();
  // Neon's HTTP transactions take a batch of queries in one round trip.
  for (let i = 0; i < queries.length; i += 200) {
    await db.transaction(queries.slice(i, i + 200).map((q) => db.query(q.text, q.params)));
  }
}

export async function loadData(therapistId: string): Promise<Data> {
  const [therapist] = await query<{ name: string; clinic: string; phone: string }>(
    "SELECT name, clinic, phone FROM therapists WHERE id = $1",
    [therapistId],
  );
  const lists = await Promise.all(
    KINDS.map(async (k) => {
      const { table, cols } = TABLES[k];
      const rows = await query(`SELECT ${cols.map((x) => x.col).join(", ")} FROM ${table} WHERE therapist_id = $1`, [therapistId]);
      return [k, rows.map((r) => toObject(cols, r))] as const;
    }),
  );
  const photoRows = await query<{ exercise_id: string; urls: string[] }>(
    "SELECT exercise_id, urls FROM photos WHERE therapist_id = $1",
    [therapistId],
  );
  return {
    clinic: { therapist: therapist?.name ?? "", clinic: therapist?.clinic ?? "", phone: therapist?.phone ?? "" },
    photos: Object.fromEntries(photoRows.map((r) => [r.exercise_id, r.urls])),
    ...(Object.fromEntries(lists) as Omit<Data, "clinic" | "photos">),
  };
}

export async function applyChanges(therapistId: string, ch: Changes) {
  const qs: Q[] = [];
  for (const k of KINDS) {
    for (const obj of ch.upsert[k] ?? []) qs.push(upsertQuery(k, therapistId, obj as Record<string, unknown>));
    const ids = ch.remove[k];
    if (ids?.length) qs.push({ text: `DELETE FROM ${TABLES[k].table} WHERE therapist_id = $1 AND id = ANY($2)`, params: [therapistId, ids] });
  }
  for (const [exerciseId, urls] of Object.entries(ch.photos ?? {})) {
    qs.push(
      urls
        ? {
            text: `INSERT INTO photos (therapist_id, exercise_id, urls) VALUES ($1, $2, $3::jsonb)
                   ON CONFLICT (therapist_id, exercise_id) DO UPDATE SET urls = EXCLUDED.urls`,
            params: [therapistId, exerciseId, JSON.stringify(urls)],
          }
        : { text: "DELETE FROM photos WHERE therapist_id = $1 AND exercise_id = $2", params: [therapistId, exerciseId] },
    );
  }
  if (ch.clinic) {
    qs.push({
      text: "UPDATE therapists SET name = $2, clinic = $3, phone = $4 WHERE id = $1",
      params: [therapistId, ch.clinic.therapist, ch.clinic.clinic, ch.clinic.phone],
    });
  }
  await run(qs);
}

/** Replace all of a therapist's records with fresh demo patients. */
export async function resetToDemo(therapistId: string, withClinic = false) {
  const qs: Q[] = [...KINDS.map((k) => TABLES[k].table), "photos"].map((t) => ({
    text: `DELETE FROM ${t} WHERE therapist_id = $1`,
    params: [therapistId],
  }));
  await run(qs);
  const demo = demoData();
  await applyChanges(therapistId, { ...asChanges(demo), clinic: withClinic ? demo.clinic : undefined });
}
