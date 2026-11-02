import { BUILTIN_EXERCISES } from "./exercises";
import type { Exercise, Lang, PassportItem } from "./types";

// Everything the patient's phone needs is packed into the QR link itself,
// so the exercise page works without an account, a server or any patient
// identifiers. Built-in exercises are sent by id and default text/video is
// omitted, which keeps links short enough for a small printed QR code.

type ItemPayload = {
  e?: string; // built-in exercise id
  n?: string; // name (custom exercises)
  s?: string[]; // steps (custom exercises)
  q?: [number, number, number, string]; // sets, reps, perDay, hold
  d?: string; // legacy: dose text
  p?: string; // precautions, omitted when it is the library default
  v?: string; // video url, omitted when it is the library default ("" = none)
  t?: string; // therapist note
};

type ExercisePayload = ItemPayload & { l?: Lang };

export type SharedExercise = {
  id?: string; // built-in id, for illustrations
  name: string;
  steps: string[];
  pa?: Exercise["pa"];
  sets?: number;
  reps?: number;
  perDay?: number;
  hold?: string;
  dose?: string; // legacy links only
  precautions: string;
  defaultPrecautions: string;
  videoUrl?: string;
  videoSource?: string;
  notes?: string;
  photos?: string[]; // therapist step photos (phone passport only)
};

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): string {
  const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

function packItem(item: PassportItem, ex: Exercise): ItemPayload {
  const out: ItemPayload = { q: [item.sets, item.reps, item.perDay, item.hold] };
  if (ex.builtin) out.e = ex.id;
  else {
    out.n = ex.name;
    out.s = ex.steps;
  }
  if (item.precautions.trim() !== ex.precautions.trim()) out.p = item.precautions;
  if ((item.videoUrl || "") !== (ex.builtin ? ex.videoUrl ?? "" : "")) out.v = item.videoUrl;
  if (item.notes) out.t = item.notes;
  return out;
}

function unpackItem(p: ItemPayload): SharedExercise | null {
  const builtin = p.e ? BUILTIN_EXERCISES.find((x) => x.id === p.e) : undefined;
  const name = builtin?.name ?? p.n;
  if (!name) return null;
  const defaultPrecautions = builtin?.precautions ?? "";
  return {
    id: builtin?.id,
    name,
    steps: builtin?.steps ?? p.s ?? [],
    pa: builtin?.pa,
    sets: p.q?.[0],
    reps: p.q?.[1],
    perDay: p.q?.[2],
    hold: p.q?.[3],
    dose: p.d,
    precautions: p.p ?? defaultPrecautions,
    defaultPrecautions,
    videoUrl: p.v ?? builtin?.videoUrl ?? undefined,
    videoSource: p.v === undefined ? builtin?.videoSource : undefined,
    notes: p.t,
  };
}

/** Full exercise info for the phone passport API (server has the whole exercise). */
export function toShared(item: PassportItem, ex: Exercise, photos?: string[]): SharedExercise {
  return {
    id: ex.builtin ? ex.id : undefined,
    name: ex.name,
    steps: ex.steps,
    pa: ex.pa,
    sets: item.sets,
    reps: item.reps,
    perDay: item.perDay,
    hold: item.hold,
    precautions: item.precautions,
    defaultPrecautions: ex.precautions,
    videoUrl: item.videoUrl || undefined,
    videoSource: item.videoUrl && item.videoUrl === ex.videoUrl ? ex.videoSource : undefined,
    notes: item.notes || undefined,
    photos: photos?.length ? photos : undefined,
  };
}

export function exerciseUrl(origin: string, item: PassportItem, ex: Exercise, lang: Lang = "en"): string {
  const payload: ExercisePayload = packItem(item, ex);
  if (lang !== "en") payload.l = lang;
  return `${origin}/e/${toBase64Url(JSON.stringify(payload))}`;
}

export function decodeExercise(code: string): { ex: SharedExercise; lang: Lang } | null {
  try {
    const p = JSON.parse(fromBase64Url(decodeURIComponent(code))) as ExercisePayload;
    const ex = unpackItem(p);
    return ex ? { ex, lang: p.l ?? "en" } : null;
  } catch {
    return null;
  }
}
