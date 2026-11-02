// Applies db/schema.sql (idempotent). Usage: node --env-file=.env.local db/migrate.mjs
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const text = readFileSync(new URL("./schema.sql", import.meta.url), "utf8").replace(/--[^\n]*/g, "");
const statements = text.split(";").map((s) => s.trim()).filter(Boolean);
for (const s of statements) await sql.query(s);
console.log(`applied ${statements.length} statements`);
