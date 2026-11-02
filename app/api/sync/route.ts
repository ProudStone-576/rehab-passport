import { KINDS, type Changes } from "@/lib/diff";
import { currentTherapist, unauthorized } from "@/lib/server/auth";
import { applyChanges } from "@/lib/server/repo";

export async function POST(req: Request) {
  const id = await currentTherapist();
  if (!id) return unauthorized();
  const ch = (await req.json().catch(() => null)) as Changes | null;
  if (!ch || typeof ch.upsert !== "object" || typeof ch.remove !== "object") return Response.json({ error: "Bad request" }, { status: 400 });
  // Only known collections are written; everything else is ignored.
  const clean: Changes = { upsert: {}, remove: {}, photos: ch.photos, clinic: ch.clinic };
  for (const k of KINDS) {
    if (Array.isArray(ch.upsert[k])) clean.upsert[k] = ch.upsert[k]!.filter((x) => typeof x?.id === "string");
    if (Array.isArray(ch.remove[k])) clean.remove[k] = ch.remove[k]!.filter((x) => typeof x === "string");
  }
  await applyChanges(id, clean);
  return Response.json({ ok: true });
}
