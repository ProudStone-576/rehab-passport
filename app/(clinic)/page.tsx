"use client";

import Link from "next/link";
import { activePassport, adherence, addDays, dateKey, fmtDate, fmtTime, nextReviewDate, passportDays, recentMaxPain } from "@/lib/logic";
import { BUILTIN_EXERCISES } from "@/lib/exercises";
import { useStore } from "@/lib/store";

export default function Dashboard() {
  const { data } = useStore();
  const today = dateKey();

  const rows = data.patients.map((pt) => {
    const p = activePassport(data, pt.id);
    const week = p ? passportDays(p).filter((d) => d > addDays(today, -7)) : [];
    const wk = p ? adherence(p, data.logs, week) : null;
    const due = p ? nextReviewDate(data, p) : null;
    const pain = p ? recentMaxPain(data.pain, p) : null;
    return { pt, p, wk, due, pain };
  });

  const active = rows.filter((r) => r.p);
  const dueSoon = active.filter((r) => r.due && r.due <= addDays(today, 3));
  const pcts = active.map((r) => r.wk?.pct).filter((x): x is number => x !== null && x !== undefined);
  const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Patients</h1>
          <p className="muted">Each patient carries a paper passport. Enter their ticks here at follow-up.</p>
        </div>
        <Link href="/patients/new" className="btn primary">+ New patient</Link>
      </div>

      <div className="stats">
        <div className="stat"><span>Active passports</span><strong>{active.length}</strong></div>
        <div className="stat"><span>Avg. completion, last 7 days</span><strong>{avg === null ? "—" : `${avg}%`}</strong></div>
        <div className="stat"><span>Visits in next 3 days</span><strong>{dueSoon.length}</strong></div>
        <div className="stat"><span>Exercises in library</span><strong>{BUILTIN_EXERCISES.length + data.exercises.length}</strong></div>
      </div>

      <div className="card flush">
        <table className="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Condition</th>
              <th>Passport</th>
              <th>Last 7 days</th>
              <th>Next visit</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ pt, p, wk, due, pain }) => (
              <tr key={pt.id}>
                <td>
                  <Link href={`/patients/${pt.id}`} className="strong-link">{pt.code}</Link>
                  <div className="muted small">{pt.initials}{pt.age ? `, ${pt.age} y` : ""}</div>
                  {pain !== null && pain >= 7 && <div><span className="pill danger">Pain {pain}/10 reported</span></div>}
                </td>
                <td>{pt.condition}</td>
                <td>{p ? <>v{p.version} · {p.items.length} exercises</> : <span className="muted">No plan yet</span>}</td>
                <td style={{ minWidth: 150 }}>
                  {wk && wk.pct !== null ? (
                    <div className="bar-row">
                      <div className="bar"><div style={{ width: `${wk.pct}%` }} className={wk.pct < 60 ? "low" : ""} /></div>
                      <span>{wk.pct}%</span>
                    </div>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td>
                  {due ? (
                    <span className={due < today ? "pill warn" : "pill"}>
                      {due < today ? "Overdue " : due === today ? "Today " : ""}{fmtDate(due)}{p?.nextVisit ? `, ${fmtTime(p.nextVisit)}` : ""}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="right">
                  {p ? (
                    <Link href={`/patients/${pt.id}`} className="btn small">Open</Link>
                  ) : (
                    <Link href={`/patients/${pt.id}/plan`} className="btn small primary">Create passport</Link>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="muted center">No patients yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="muted small note">
        Data is saved to the clinic database and syncs with patients&apos; phones. Use coded patients (P-001) — no real names or identifiers.
      </p>
    </>
  );
}
