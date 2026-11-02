"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  activePassport, adherence, dateKey, defaultVisit, doseText, findExercise, fmtDate, fmtDay, fmtTime, isDone, logId,
  painId, passportDays, visitPeriod, uid,
} from "@/lib/logic";
import { useStore } from "@/lib/store";
import type { Feedback, Lang, Passport, Review } from "@/lib/types";

export default function PatientPage({ id }: { id: string }) {
  const { data, update } = useStore();
  const router = useRouter();
  const [history, setHistory] = useState(false);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- window is only available after mount
    setOrigin(window.location.origin);
  }, []);

  const patient = data.patients.find((p) => p.id === id);
  const p = activePassport(data, id);
  const versions = data.passports.filter((x) => x.patientId === id).sort((a, b) => b.version - a.version);

  if (!patient) return <p>Patient not found. <Link href="/">Back</Link></p>;

  const today = dateKey();
  const period = p ? visitPeriod(data, p) : null;
  const days = p && period ? (history ? passportDays(p) : period.days) : [];
  const periodAdh = p && period ? adherence(p, data.logs, period.elapsed) : null;
  const reviews = data.reviews.filter((r) => r.patientId === id).sort((a, b) => b.date.localeCompare(a.date));
  const feedback = data.feedback.filter((f) => f.patientId === id).sort((a, b) => b.date.localeCompare(a.date));
  const phoneLink = origin ? `${origin}/p/${patient.phoneToken}` : "";

  function toggle(pp: Passport, itemId: string, date: string) {
    const lid = logId(pp.id, itemId, date);
    update((d) => ({
      ...d,
      logs: d.logs.some((l) => l.id === lid)
        ? d.logs.filter((l) => l.id !== lid)
        : [...d.logs, { id: lid, passportId: pp.id, itemId, date, source: "paper" }],
    }));
  }

  function setPain(pp: Passport, date: string, value: string) {
    const pid = painId(pp.id, date);
    update((d) => {
      const rest = d.pain.filter((x) => x.id !== pid);
      if (value === "") return { ...d, pain: rest };
      return { ...d, pain: [...rest, { id: pid, passportId: pp.id, date, score: Number(value), source: "paper" }] };
    });
  }

  function setVisit(pp: Passport, nextVisit: string) {
    update((d) => ({ ...d, passports: d.passports.map((x) => (x.id === pp.id ? { ...x, nextVisit: nextVisit || undefined } : x)) }));
  }

  function remove() {
    if (!confirm(`Delete ${patient!.code} and all their records?`)) return;
    const ids = new Set(versions.map((h) => h.id));
    update((d) => ({
      ...d,
      patients: d.patients.filter((x) => x.id !== id),
      passports: d.passports.filter((x) => x.patientId !== id),
      logs: d.logs.filter((l) => !ids.has(l.passportId)),
      pain: d.pain.filter((x) => !ids.has(x.passportId)),
      reviews: d.reviews.filter((r) => r.patientId !== id),
      feedback: d.feedback.filter((f) => f.patientId !== id),
    }));
    router.push("/");
  }

  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/" className="muted small">← Patients</Link>
          <h1>{patient.code} <span className="muted light">{patient.initials}{patient.age ? `, ${patient.age} y` : ""}</span></h1>
          <p className="muted">{patient.condition}</p>
          <label className="inline-select">
            Passport language
            <select
              value={patient.language}
              onChange={(e) => {
                const language = e.target.value as Lang;
                update((d) => ({ ...d, patients: d.patients.map((x) => (x.id === id ? { ...x, language } : x)) }));
              }}
            >
              <option value="en">English</option>
              <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="both">Both — ਪੰਜਾਬੀ + English</option>
            </select>
          </label>
        </div>
        <div className="row-gap">
          {p && phoneLink && (
            <>
              <a href={phoneLink} target="_blank" rel="noreferrer" className="btn">📱 Patient&apos;s phone view</a>
              <button
                type="button"
                className="btn"
                onClick={() => navigator.clipboard?.writeText(phoneLink).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                })}
              >
                {copied ? "Copied ✓" : "Copy phone link"}
              </button>
            </>
          )}
          {p && <Link href={`/patients/${id}/print`} className="btn">🖨 Print passport</Link>}
          <Link href={`/patients/${id}/plan`} className="btn primary">{p ? "Adjust plan" : "Create passport"}</Link>
        </div>
      </div>

      {!p || !period ? (
        <div className="card empty">
          <p>No passport yet. Start with <strong>Assess → Personalize → Demonstrate</strong>.</p>
          <Link href={`/patients/${id}/plan`} className="btn primary">Create passport</Link>
        </div>
      ) : (
        <>
          <div className="stats">
            <div className="stat"><span>Passport</span><strong>v{p.version}</strong><small>since {fmtDate(p.startDate)}</small></div>
            <div className="stat">
              <span>This visit period</span>
              <strong>{periodAdh?.pct ?? 0}%</strong>
              <small>{periodAdh?.done} of {periodAdh?.expected} exercise-days so far</small>
            </div>
            <div className={period.overdue ? "stat warn" : "stat"}>
              <span>Next visit</span>
              <strong className="sm">{fmtDate(period.visit)}{p.nextVisit ? `, ${fmtTime(p.nextVisit)}` : ""}</strong>
              <small>
                {period.overdue ? "Overdue" : period.daysLeft === 0 ? "Today" : `in ${period.daysLeft} day${period.daysLeft === 1 ? "" : "s"}`}
                {!p.nextVisit && " · not booked"}
              </small>
              <input
                type="datetime-local"
                className="visit-input"
                aria-label="Reschedule next visit"
                value={p.nextVisit ?? ""}
                onChange={(e) => setVisit(p, e.target.value)}
              />
            </div>
            <div className="stat"><span>Setup time</span><strong>{p.setupMinutes} min</strong></div>
          </div>

          <section className="card">
            <div className="card-head">
              <h2>4 · Track — {history ? "whole passport" : "this visit period"}</h2>
              <span className="muted small">
                {history ? `${fmtDate(p.startDate)} → today` : `${fmtDate(period.start)} → visit ${fmtDate(period.visit)}`}
                {" · "}
                <button type="button" className="link small" onClick={() => setHistory(!history)}>
                  {history ? "Show this visit period" : "Show whole passport"}
                </button>
              </span>
            </div>
            <p className="muted small">
              Ticks from the patient&apos;s phone appear automatically. Tap a box to copy a tick from the paper passport.
            </p>
            <div className="log-wrap">
              <table className="log">
                <thead>
                  <tr>
                    <th>Exercise</th>
                    {days.map((d) => (
                      <th key={d} className={d === today ? "today" : d === period.visit ? "visit" : ""}>{fmtDay(d)}</th>
                    ))}
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {p.items.map((it) => {
                    const ex = findExercise(data, it.exerciseId);
                    const past = days.filter((d) => d <= today);
                    const doneCount = past.filter((d) => isDone(data.logs, p.id, it.id, d)).length;
                    return (
                      <tr key={it.id}>
                        <td>
                          <strong>{ex?.name}</strong>
                          <div className="muted small">{doseText(it)}</div>
                        </td>
                        {days.map((d) => {
                          const log = data.logs.find((l) => l.id === logId(p.id, it.id, d));
                          const future = d > today;
                          return (
                            <td key={d}>
                              <button
                                type="button"
                                className={`box${log ? " on" : ""}${log?.source === "phone" ? " phone" : ""}`}
                                disabled={future}
                                title={log ? `Done (${log.source})` : future ? "Upcoming" : "Not done"}
                                aria-label={`${ex?.name} ${d} ${log ? "done" : "not done"}`}
                                onClick={() => toggle(p, it.id, d)}
                              >
                                {log ? "✓" : ""}
                              </button>
                            </td>
                          );
                        })}
                        <td className="pct">{past.length ? Math.round((doneCount / past.length) * 100) : 0}%</td>
                      </tr>
                    );
                  })}
                  <tr className="pain-row">
                    <td>
                      <strong>Pain</strong>
                      <div className="muted small">0 = none · 10 = worst</div>
                    </td>
                    {days.map((d) => {
                      const entry = data.pain.find((x) => x.id === painId(p.id, d));
                      return (
                        <td key={d}>
                          <select
                            className={`pain-cell${entry ? ` p${Math.min(3, Math.floor(entry.score / 3.4) + 1)}` : ""}${entry && entry.score >= 7 ? " high" : ""}`}
                            value={entry?.score ?? ""}
                            disabled={d > today}
                            aria-label={`Pain on ${d}`}
                            onChange={(e) => setPain(p, d, e.target.value)}
                          >
                            <option value="">–</option>
                            {Array.from({ length: 11 }, (_, n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </td>
                      );
                    })}
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="muted small legend">
              <span className="box on sample">✓</span> paper/clinic <span className="box on phone sample">✓</span> from phone
              <span className="pain-cell high sample">7</span> pain 7+ — check safety
            </p>
            {p.assessment && <p className="muted small"><strong>Assessment:</strong> {p.assessment}</p>}
          </section>

          <div className="grid2 top">
            <ReviewForm
              key={p.id}
              initialVisit={p.nextVisit && p.nextVisit.slice(0, 10) > today ? p.nextVisit : defaultVisit()}
              onSave={(r, nextVisit) => {
                update((d) => ({
                  ...d,
                  reviews: [...d.reviews, { ...r, id: uid(), patientId: id, passportId: p.id }],
                  passports: d.passports.map((x) =>
                    x.id === p.id ? { ...x, nextVisit: r.outcome === "discharged" ? undefined : nextVisit || undefined } : x,
                  ),
                }));
                if (r.outcome === "modified") router.push(`/patients/${id}/plan`);
              }}
            />
            <FeedbackForm
              onSave={(f) => update((d) => ({ ...d, feedback: [...d.feedback, { ...f, id: uid(), patientId: id, passportId: p.id }] }))}
            />
          </div>
        </>
      )}

      <div className="grid2 top">
        <section className="card">
          <h2>Review history</h2>
          {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="entry">
              <div className="entry-head">
                <strong>{fmtDate(r.date)}</strong>
                <span className={`pill ${r.outcome}`}>{r.outcome}</span>
                <span className="muted small">{r.minutes} min</span>
              </div>
              <p>{r.notes}</p>
            </div>
          ))}
        </section>
        <section className="card">
          <h2>Patient feedback</h2>
          {feedback.length === 0 && <p className="muted">No feedback yet.</p>}
          {feedback.map((f) => (
            <div key={f.id} className="entry">
              <div className="entry-head">
                <strong>{fmtDate(f.date)}</strong>
                <span className="pill">Ease {f.ease}/5</span>
                <span className="pill">Understood: {f.understood}</span>
              </div>
              {f.comments && <p>“{f.comments}”</p>}
            </div>
          ))}
        </section>
      </div>

      {versions.length > 0 && (
        <section className="card">
          <h2>Passport versions</h2>
          <table className="table">
            <thead><tr><th>Version</th><th>Period</th><th>Exercises</th><th>Completion</th></tr></thead>
            <tbody>
              {versions.map((h) => (
                <tr key={h.id}>
                  <td>v{h.version} {h.status === "active" && <span className="pill">active</span>}</td>
                  <td>{fmtDate(h.startDate)} – {h.endDate ? fmtDate(h.endDate) : "now"}</td>
                  <td>{h.items.map((i) => findExercise(data, i.exerciseId)?.name).join(", ")}</td>
                  <td>{adherence(h, data.logs).pct ?? 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <p className="note"><button type="button" className="link danger" onClick={remove}>Delete patient</button></p>
    </>
  );
}

function ReviewForm({
  initialVisit, onSave,
}: { initialVisit: string; onSave: (r: Omit<Review, "id" | "patientId" | "passportId">, nextVisit: string) => void }) {
  const [minutes, setMinutes] = useState("10");
  const [outcome, setOutcome] = useState<Review["outcome"]>("continue");
  const [notes, setNotes] = useState("");
  const [visit, setVisit] = useState(initialVisit);
  return (
    <form
      className="card form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ date: dateKey(), minutes: Number(minutes) || 0, outcome, notes }, visit);
        setNotes("");
      }}
    >
      <h2>5 · Review — follow-up visit</h2>
      <div className="grid2">
        <label>Outcome
          <select value={outcome} onChange={(e) => setOutcome(e.target.value as Review["outcome"])}>
            <option value="continue">Continue same plan</option>
            <option value="modified">Modify plan (opens editor)</option>
            <option value="discharged">Discharged</option>
          </select>
        </label>
        <label>Minutes spent<input type="number" min={0} value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label>
      </div>
      {outcome !== "discharged" && (
        <label>Next follow-up visit (date and time)
          <input type="datetime-local" value={visit} onChange={(e) => setVisit(e.target.value)} />
        </label>
      )}
      <label>Notes<textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} required
        placeholder="Progress, pain, safety concerns, reasons for change" /></label>
      <div className="actions"><button className="btn primary" type="submit">Save review</button></div>
    </form>
  );
}

function FeedbackForm({ onSave }: { onSave: (f: Omit<Feedback, "id" | "patientId" | "passportId">) => void }) {
  const [ease, setEase] = useState(4);
  const [understood, setUnderstood] = useState<Feedback["understood"]>("yes");
  const [comments, setComments] = useState("");
  return (
    <form
      className="card form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ date: dateKey(), ease, understood, comments });
        setComments("");
      }}
    >
      <h2>Patient usability feedback</h2>
      <label>How easy was the passport to use?
        <div className="scale">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" className={n === ease ? "on" : ""} onClick={() => setEase(n)}>{n}</button>
          ))}
          <span className="muted small">1 = very hard · 5 = very easy</span>
        </div>
      </label>
      <label>Did they understand the instructions?
        <select value={understood} onChange={(e) => setUnderstood(e.target.value as Feedback["understood"])}>
          <option value="yes">Yes</option>
          <option value="partly">Partly</option>
          <option value="no">No</option>
        </select>
      </label>
      <label>Comments (patient&apos;s words)<textarea rows={2} value={comments} onChange={(e) => setComments(e.target.value)} /></label>
      <div className="actions"><button className="btn primary" type="submit">Save feedback</button></div>
    </form>
  );
}
