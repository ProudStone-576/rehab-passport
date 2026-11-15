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
      <section className="login-side" aria-label="About Rehab Passport">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">RP</span>
          <span>
            <strong>Rehab Passport</strong>
            <small>QR-assisted home exercise support</small>
          </span>
        </div>
        <div>
          <h1>A paper passport for home exercises</h1>
          <p lang="pa" className="pa-line">ਰੀਹੈਬ ਪਾਸਪੋਰਟ</p>
          <p>Patients follow their exercises on paper or on their phone. You see their ticks and pain before the next visit.</p>
        </div>
        <ol className="login-steps">
          <li><b>Assess</b>Pick exercises from the library.</li>
          <li><b>Personalize</b>Sets, reps and safety advice.</li>
          <li><b>Demonstrate</b>Printed pictures and a QR demo.</li>
          <li><b>Track</b>Daily ticks and a pain score.</li>
          <li><b>Review</b>Check progress at the next visit.</li>
        </ol>
      </section>

      <div className="login-main">
        <div className="login-card">
          <h2>{mode === "in" ? "Sign in to your clinic" : "Create a clinic account"}</h2>

          <div className="tabs" role="group" aria-label="Account">
            <button type="button" aria-pressed={mode === "in"} className={mode === "in" ? "on" : ""} onClick={() => setMode("in")}>Sign in</button>
            <button type="button" aria-pressed={mode === "up"} className={mode === "up" ? "on" : ""} onClick={() => setMode("up")}>Create account</button>
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
                <label>Your name<input name="name" value={form.name} onChange={set("name")} required autoComplete="name" /></label>
                <label>Clinic or institution<input name="clinic" value={form.clinic} onChange={set("clinic")} autoComplete="organization" /></label>
              </>
            )}
            <label>Email<input name="email" type="email" value={form.email} onChange={set("email")} required autoComplete="email" inputMode="email" /></label>
            <label>
              Password
              <input name="password" type="password" value={form.password} onChange={set("password")} required minLength={mode === "up" ? 8 : undefined}
                autoComplete={mode === "in" ? "current-password" : "new-password"} />
              {mode === "up" && <span className="hint">At least 8 characters.</span>}
            </label>
            {error && <p className="err" role="alert">{error}</p>}
            <button className="btn primary" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</button>
          </form>

          <div className="or">or</div>
          <button type="button" className="btn" disabled={busy} onClick={() => post("/api/auth/demo")}>
            Open demo clinic
          </button>
          <p className="muted small center">Shared demo with made-up patients. Anyone can edit it, so use your own account for real work.</p>
        </div>
      </div>
    </main>
  );
}
