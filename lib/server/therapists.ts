import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { uid } from "@/lib/logic";
import { query } from "./db";
import { resetToDemo } from "./repo";

// Shared public demo clinic for presentations. Its password is random and
// never used: it is entered only through the "Open demo clinic" button.
export const DEMO_EMAIL = "demo@rehab-passport.test";

export type Me = { id: string; name: string; email: string; demo: boolean };

export async function findByEmail(email: string) {
  const [row] = await query<{ id: string; password_hash: string }>(
    "SELECT id, password_hash FROM therapists WHERE email = $1",
    [email.trim().toLowerCase()],
  );
  return row ?? null;
}

export async function createTherapist(email: string, name: string, password: string, clinic = ""): Promise<string> {
  const id = uid();
  await query(
    "INSERT INTO therapists (id, email, name, password_hash, clinic) VALUES ($1, $2, $3, $4, $5)",
    [id, email.trim().toLowerCase(), name.trim(), await bcrypt.hash(password, 10), clinic.trim()],
  );
  return id;
}

export async function checkPassword(hash: string, password: string) {
  return bcrypt.compare(password, hash);
}

export async function demoTherapist(): Promise<string> {
  const found = await findByEmail(DEMO_EMAIL);
  if (found) return found.id;
  const id = await createTherapist(DEMO_EMAIL, "Demo therapist", randomBytes(24).toString("base64url"));
  await resetToDemo(id, true);
  return id;
}

export async function me(id: string): Promise<Me | null> {
  const [row] = await query<{ id: string; name: string; email: string }>("SELECT id, name, email FROM therapists WHERE id = $1", [id]);
  return row ? { ...row, demo: row.email === DEMO_EMAIL } : null;
}
