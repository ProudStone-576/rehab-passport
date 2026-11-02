import { currentTherapist, unauthorized } from "@/lib/server/auth";
import { resetToDemo } from "@/lib/server/repo";

export async function POST() {
  const id = await currentTherapist();
  if (!id) return unauthorized();
  await resetToDemo(id);
  return Response.json({ ok: true });
}
