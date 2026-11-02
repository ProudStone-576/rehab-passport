"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [form, setForm] = useState({ name: "", email: "", password: "", clinic: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function post(url: string, body?: unknown) {
    setBusy(true);
    setError("");
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body ?? {}) }).catch(() => null);
    setBusy(false);
    if (!res) return setError("Can't reach the server.");
    if (!res.ok) return setError(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Something went wrong.");
    router.replace("/");
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <main className="login">
      <div className="login-card">
        <div className="brand dark">
          <span className="brand-mark">RP</span>
          <span>
            <strong>Rehab Passport</strong>
            <small>QR-assisted home exercise support</small>
          </span>
        </div>

        <div className="tabs">
          <button type="button" className={mode === "in" ? "on" : ""} onClick={() => setMode("in")}>Sign in</button>
          <button type="button" className={mode === "up" ? "on" : ""} onClick={() => setMode("up")}>Create account</button>
        </div>

        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            post(mode === "in" ? "/api/auth/login" : "/api/auth/register", form);
          }}
        >
          {mode === "up" && (
            <>
              <label>Your name<input value={form.name} onChange={set("name")} required autoComplete="name" /></label>
              <label>Clinic / institution<input value={form.clinic} onChange={set("clinic")} /></label>
            </>
          )}
          <label>Email<input type="email" value={form.email} onChange={set("email")} required autoComplete="email" /></label>
          <label>
            Password
            <input type="password" value={form.password} onChange={set("password")} required minLength={mode === "up" ? 8 : undefined}
              autoComplete={mode === "in" ? "current-password" : "new-password"} />
          </label>
          {error && <p className="err">{error}</p>}
          <button className="btn primary" type="submit" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</button>
        </form>

        <div className="or"><span>or</span></div>
        <button type="button" className="btn block-btn" disabled={busy} onClick={() => post("/api/auth/demo")}>
          Open demo clinic
        </button>
        <p className="muted small center">Shared demo with made-up patients — anyone can edit it. Use your own account for real work.</p>
      </div>
    </main>
  );
}
