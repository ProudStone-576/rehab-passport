import { currentTherapist, unauthorized } from "@/lib/server/auth";
import { loadData } from "@/lib/server/repo";
import { me } from "@/lib/server/therapists";

export async function GET() {
  const id = await currentTherapist();
  const who = id ? await me(id) : null;
  if (!who) return unauthorized();
  return Response.json({ me: who, data: await loadData(who.id) }, { headers: { "cache-control": "no-store" } });
}
