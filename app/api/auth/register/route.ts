import { startSession } from "@/lib/server/auth";
import { DEMO_EMAIL, createTherapist, findByEmail } from "@/lib/server/therapists";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; email?: string; password?: string; clinic?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!body.name?.trim() || !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter your name and a valid email." }, { status: 400 });
  if ((body.password ?? "").length < 8) return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  if (email === DEMO_EMAIL || (await findByEmail(email))) return Response.json({ error: "An account with this email already exists." }, { status: 409 });
  const id = await createTherapist(email, body.name, body.password!, body.clinic ?? "");
  await startSession(id);
  return Response.json({ ok: true });
}
