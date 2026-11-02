import { startSession } from "@/lib/server/auth";
import { demoTherapist } from "@/lib/server/therapists";

export async function POST() {
  await startSession(await demoTherapist());
  return Response.json({ ok: true });
}
