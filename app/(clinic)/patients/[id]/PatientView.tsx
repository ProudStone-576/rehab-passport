"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Figure from "@/components/Figure";
import Icon from "@/components/Icon";
import {
  activePassport, addDays, adherence, dateKey, defaultVisit, doseText, findExercise, fmtDate, fmtDay, fmtTime, isDone, logId,
  painId, passportDays, visitPeriod, uid,
} from "@/lib/logic";
import { useStore } from "@/lib/store";
import type { Feedback, Lang, Passport, Review } from "@/lib/types";

export default function PatientPage({ id, tab }: { id: string; tab: string }) {
  const { data, update } = useStore();
  const router = useRouter();
  const [history, setHistory] = useState(false);
  const [origin, setOrigin] = useState("");
  const [toast, setToast] = useState("");
  const say = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- window is only available after mount
    setOrigin(window.location.origin);
  }, []);

  const patient = data.patients.find((p) => p.id === id);
  const p = activePassport(data, id);
  const versions = data.passports.filter((x) => x.patientId === id).sort((a, b) => b.version - a.version);

  if (!patient) {
    return (
      <div className="card empty">
        <strong>Patient not found</strong>
        <span>They may have been deleted, or the link is wrong.</span>
        <Link href="/patients" className="btn">Back to patients</Link>
      </div>
    );
  }

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
    router.push("/patients");
  }

  const recentPain = p ? data.pain.filter((x) => x.passportId === p.id && x.date > addDays(today, -3) && x.date <= today) : [];
  const maxPain = recentPain.length ? Math.max(...recentPain.map((x) => x.score)) : null;
  const TABS = [
    { id: "", label: "Overview" },
    { id: "tracking", label: "Exercise tracking" },
    { id: "review", label: "Clinical review", count: reviews.length },
    { id: "feedback", label: "Feedback", count: feedback.length },
    { id: "history", label: "Passport history", count: versions.length },
  ];
  const current = TABS.some((t) => t.id === tab) ? tab : "";
  const href = (t: string) => (t ? `?tab=${t}` : `/patients/${id}`);

  return (
    <>
      <Link href="/patients" className="crumb"><Icon name="back" size={16} />Patients</Link>
      <div className="page-head patient-head">
        <div>
          <h1>{patient.code} <span className="light">{patient.initials}{patient.age ? `, ${patient.age} y` : ""}</span></h1>
          <p>{patient.condition}</p>
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
              <option value="both">Both: ਪੰਜਾਬੀ + English</option>
            </select>
          </label>
        </div>
        <div className="head-actions wrap">
          {p && phoneLink && (
            <>
              <a href={phoneLink} target="_blank" rel="noreferrer" className="btn"><Icon name="phone" size={18} />Phone view</a>
              <button
                type="button"
                className="btn"
                onClick={() => navigator.clipboard?.writeText(phoneLink).then(() => say("Phone link copied"), () => say("Copy failed. Open the phone view and copy its address."))}
              >
                <Icon name="copy" size={18} />Copy phone link
              </button>
            </>
          )}
          {p && <Link href={`/patients/${id}/print`} className="btn"><Icon name="print" size={18} />Print passport</Link>}
          <Link href={`/patients/${id}/plan`} className="btn primary"><Icon name="edit" size={18} />{p ? "Adjust plan" : "Create passport"}</Link>
        </div>
      </div>

      {!p || !period ? (
        <div className="card empty">
          <strong>No passport yet</strong>
          <span>Start with Assess, Personalize and Demonstrate. It takes a few minutes.</span>
          <Link href={`/patients/${id}/plan`} className="btn primary">Create passport</Link>
        </div>
      ) : (
        <>
          {(period.overdue || (maxPain !== null && maxPain >= 7)) && (
            <div className="alerts">
              {maxPain !== null && maxPain >= 7 && (
                <div className="alert danger" role="alert">
                  <Icon name="alert" />
                  <p><strong>Pain {maxPain}/10 reported in the last 3 days.</strong> Check safety before the next visit.</p>
                </div>
              )}
              {period.overdue && (
                <div className="alert warn">
                  <Icon name="calendar" />
                  <p><strong>Visit overdue since {fmtDate(period.visit)}.</strong> Change the date under Next visit on the Overview, or contact the patient.</p>
                </div>
              )}
            </div>
          )}

          <nav className="tabbar" aria-label="Patient sections">
            {TABS.map((t) => (
              <Link key={t.id} href={href(t.id)} replace scroll={false} aria-current={current === t.id ? "page" : undefined}>
                {t.label}
                {t.count !== undefined && <span className="count">{t.count}</span>}
              </Link>
            ))}
          </nav>

          {current === "" && (
            <div className="tab-panel">
              <div className="stats">
                <div className="stat"><span>Passport</span><strong>v{p.version}</strong><small>since {fmtDate(p.startDate)}</small></div>
                <div className="stat">
                  <span>This visit period</span>
                  <strong>{periodAdh?.pct ?? 0}%</strong>
                  <small>{periodAdh?.done} of {periodAdh?.expected} exercise-days so far</small>
                </div>
                <div className={period.overdue ? "stat visit-stat warn" : "stat visit-stat"}>
                  <span>Next visit</span>
                  <strong className="sm">{fmtDate(period.visit)}{p.nextVisit ? `, ${fmtTime(p.nextVisit)}` : ""}</strong>
                  <small>
                    {period.overdue ? "Overdue" : period.daysLeft === 0 ? "Today" : `in ${period.daysLeft} day${period.daysLeft === 1 ? "" : "s"}`}
                    {!p.nextVisit && ", not booked"}
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

              <section className="card" aria-labelledby="plan-h">
                <div className="card-head">
                  <h2 id="plan-h">Current plan</h2>
                  <Link href={href("tracking")} replace scroll={false} className="link">Open the tick grid</Link>
                </div>
                <ul className="plan-list">
                  {p.items.map((it) => {
                    const ex = findExercise(data, it.exerciseId);
                    const past = period.elapsed;
                    const done = past.filter((d) => isDone(data.logs, p.id, it.id, d)).length;
                    const pct = past.length ? Math.round((done / past.length) * 100) : 0;
                    return (
                      <li key={it.id}>
                        <span className="plan-fig">{ex?.builtin ? <Figure exerciseId={it.exerciseId} frame={1} height={56} /> : null}</span>
                        <span className="plan-name">
                          <strong>{ex?.name}</strong>
                          {ex?.pa && <span lang="pa" className="muted small">{ex.pa.name}</span>}
                        </span>
                        <span className="plan-dose">{doseText(it)}</span>
                        <span className="bar-row plan-bar">
                          <span className="bar" aria-hidden="true"><span style={{ width: `${pct}%` }} className={pct < 60 ? "low" : ""} /></span>
                          <span>{pct}%</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {p.assessment && <p className="muted small plan-note"><strong>Assessment:</strong> {p.assessment}</p>}
              </section>

              {phoneLink && (
                <section className="card phone-card" aria-labelledby="phone-h">
                  <div>
                    <h2 id="phone-h">Patient&apos;s phone link</h2>
                    <p className="muted">Ticks and pain scores from this link appear here within seconds. It never shows the patient&apos;s name or condition.</p>
                  </div>
                  <code className="link-box">{phoneLink}</code>
                </section>
              )}
            </div>
          )}

          {current === "tracking" && (
            <section className="card tab-panel" aria-labelledby="track-h">
              <div className="card-head">
                <h2 id="track-h">Track: {history ? "whole passport" : "this visit period"}</h2>
                <span className="muted small">
                  {history ? `${fmtDate(p.startDate)} to today` : `${fmtDate(period.start)} to visit ${fmtDate(period.visit)}`}
                  {", "}
                  <button type="button" className="link small" onClick={() => setHistory(!history)}>
                    {history ? "show this visit period" : "show whole passport"}
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
                      <th scope="col">Exercise</th>
                      {days.map((d) => (
                        <th scope="col" key={d} className={d === today ? "today" : d === period.visit ? "visit" : ""}>{fmtDay(d)}</th>
                      ))}
                      <th scope="col">%</th>
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
                                  aria-pressed={!!log}
                                  onClick={() => toggle(p, it.id, d)}
                                >
                                  {log ? <Icon name="check" size={16} /> : ""}
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
                        <div className="muted small">0 is none, 10 is worst</div>
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
              <p className="legend">
                <span className="box on sample" aria-hidden="true"><Icon name="check" size={14} /></span> paper or clinic
                <span className="box on phone sample" aria-hidden="true"><Icon name="check" size={14} /></span> from phone
                <span className="pain-cell high sample" aria-hidden="true">7</span> pain 7 or more: check safety
              </p>
              {p.assessment && <p className="muted small"><strong>Assessment:</strong> {p.assessment}</p>}
            </section>
          )}

          {current === "review" && (
            <div className="grid2 tab-panel review-grid">
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
                  say("Review saved");
                  if (r.outcome === "modified") router.push(`/patients/${id}/plan`);
                }}
              />
              <section className="card">
                <h2>Review history</h2>
                {reviews.length === 0 && <p className="muted">No reviews yet. Save one at the follow-up visit.</p>}
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
            </div>
          )}

          {current === "feedback" && (
            <div className="grid2 tab-panel review-grid">
              <FeedbackForm
                onSave={(f) => {
                  update((d) => ({ ...d, feedback: [...d.feedback, { ...f, id: uid(), patientId: id, passportId: p.id }] }));
                  say("Feedback saved");
                }}
              />
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
          )}
        </>
      )}

      {(current === "history" || !p) && versions.length > 0 && (
        <section className="card flush tab-panel">
          <div className="card-head"><h2>Passport versions</h2></div>
          <table className="table">
            <thead><tr><th scope="col">Version</th><th scope="col">Period</th><th scope="col">Exercises</th><th scope="col">Completion</th></tr></thead>
            <tbody>
              {versions.map((h) => (
                <tr key={h.id}>
                  <td>v{h.version} {h.status === "active" && <span className="pill">active</span>}</td>
                  <td className="num">{fmtDate(h.startDate)} to {h.endDate ? fmtDate(h.endDate) : "now"}</td>
                  <td>{h.items.map((i) => findExercise(data, i.exerciseId)?.name).join(", ")}</td>
                  <td className="num">{adherence(h, data.logs).pct ?? 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {(current === "history" || !p) && <p className="note danger-zone"><button type="button" className="link danger" onClick={remove}>Delete patient and all their records</button></p>}
      {toast && <div className="toast" role="status"><Icon name="check" />{toast}</div>}
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
      <h2>Follow-up visit</h2>
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
            <button key={n} type="button" className={n === ease ? "on" : ""} aria-pressed={n === ease} onClick={() => setEase(n)}>{n}</button>
          ))}
          <span className="muted small">1 is very hard, 5 is very easy</span>
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
