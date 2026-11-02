import { startSession } from "@/lib/server/auth";
import { checkPassword, findByEmail } from "@/lib/server/therapists";

export async function POST(req: Request) {
  const { email, password } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!email || !password) return Response.json({ error: "Enter email and password." }, { status: 400 });
  const t = await findByEmail(email);
  if (!t || !(await checkPassword(t.password_hash, password))) {
    return Response.json({ error: "Wrong email or password." }, { status: 401 });
  }
  await startSession(t.id);
  return Response.json({ ok: true });
}
