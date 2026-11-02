import type { Clinic, Data } from "./types";

// The UI edits one in-memory `Data` object (see lib/store.tsx). After each
// edit the store diffs old vs new and sends only the changed rows to
// /api/sync, so every screen keeps its simple `update(d => ...)` style while
// the database stays relational.

export const KINDS = ["patients", "passports", "logs", "pain", "reviews", "feedback", "exercises"] as const;
export type Kind = (typeof KINDS)[number];

export type Changes = {
  upsert: Partial<Record<Kind, { id: string }[]>>;
  remove: Partial<Record<Kind, string[]>>;
  photos?: Record<string, string[] | null>; // null = delete
  clinic?: Clinic;
};

export function isEmpty(c: Changes): boolean {
  return !Object.keys(c.upsert).length && !Object.keys(c.remove).length && !c.photos && !c.clinic;
}

export function diff(prev: Data, next: Data): Changes {
  const out: Changes = { upsert: {}, remove: {} };
  for (const k of KINDS) {
    const a = prev[k] as { id: string }[];
    const b = next[k] as { id: string }[];
    if (a === b) continue;
    const old = new Map(a.map((x) => [x.id, x]));
    const ups = b.filter((x) => {
      const o = old.get(x.id);
      return o !== x && (!o || JSON.stringify(o) !== JSON.stringify(x));
    });
    const ids = new Set(b.map((x) => x.id));
    const rem = a.filter((x) => !ids.has(x.id)).map((x) => x.id);
    if (ups.length) out.upsert[k] = ups;
    if (rem.length) out.remove[k] = rem;
  }
  if (prev.photos !== next.photos) {
    const photos: Record<string, string[] | null> = {};
    for (const key of new Set([...Object.keys(prev.photos), ...Object.keys(next.photos)])) {
      if (prev.photos[key] !== next.photos[key]) photos[key] = next.photos[key]?.length ? next.photos[key] : null;
    }
    if (Object.keys(photos).length) out.photos = photos;
  }
  if (JSON.stringify(prev.clinic) !== JSON.stringify(next.clinic)) out.clinic = next.clinic;
  return out;
}

/** Everything in `d` as one big upsert (used to seed demo data). */
export function asChanges(d: Data): Changes {
  const upsert: Changes["upsert"] = {};
  for (const k of KINDS) if ((d[k] as unknown[]).length) upsert[k] = d[k] as { id: string }[];
  return { upsert, remove: {}, photos: Object.keys(d.photos).length ? d.photos : undefined };
}
