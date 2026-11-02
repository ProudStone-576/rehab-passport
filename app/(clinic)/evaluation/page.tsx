"use client";

import { useState } from "react";
import { adherence, findExercise } from "@/lib/logic";
import { useStore } from "@/lib/store";

function avg(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export default function Evaluation() {
  const { data, update, reset } = useStore();
  const [clinic, setClinic] = useState(data.clinic);

  // 1. Exercise-log completion, per passport version
  const perPassport = data.passports.map((p) => ({
    p,
    patient: data.patients.find((x) => x.id === p.patientId),
    a: adherence(p, data.logs),
  }));
  const totDone = perPassport.reduce((s, x) => s + x.a.done, 0);
  const totExp = perPassport.reduce((s, x) => s + x.a.expected, 0);

  // Completion by exercise across all passports
  const byExercise = new Map<string, { done: number; expected: number }>();
  for (const { p } of perPassport) {
    for (const it of p.items) {
      const a = adherence({ ...p, items: [it] }, data.logs.filter((l) => l.itemId === it.id));
      const cur = byExercise.get(it.exerciseId) ?? { done: 0, expected: 0 };
      byExercise.set(it.exerciseId, { done: cur.done + a.done, expected: cur.expected + a.expected });
    }
  }

  // 2 + 3. Usability and understanding
  const ease = avg(data.feedback.map((f) => f.ease));
  const understood = data.feedback.length
    ? Math.round((data.feedback.filter((f) => f.understood === "yes").length / data.feedback.length) * 100)
    : null;

  // 4. Clinician time
  const setup = avg(data.passports.filter((p) => p.version === 1).map((p) => p.setupMinutes));
  const update_ = avg(data.passports.filter((p) => p.version > 1).map((p) => p.setupMinutes));
  const review = avg(data.reviews.map((r) => r.minutes));

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rehab-passport-data.json";
    a.click();
  }

  function exportCsv() {
    const rows = [["patient", "version", "exercise", "date", "source"]];
    for (const l of data.logs) {
      const p = data.passports.find((x) => x.id === l.passportId);
      const it = p?.items.find((i) => i.id === l.itemId);
      const pt = data.patients.find((x) => x.id === p?.patientId);
      rows.push([pt?.code ?? "", String(p?.version ?? ""), it ? findExercise(data, it.exerciseId)?.name ?? "" : "", l.date, l.source]);
    }
    const blob = new Blob([rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "exercise-log.csv";
    a.click();
  }

  const fmt = (n: number | null, d = 1) => (n === null ? "—" : n.toFixed(d));

  // Safety monitoring: pain reports per passport (first 3 vs last 3 reports).
  const painRows = data.passports.map((p) => {
    const xs = data.pain.filter((x) => x.passportId === p.id).sort((a, b) => a.date.localeCompare(b.date));
    return {
      p,
      patient: data.patients.find((x) => x.id === p.patientId),
      n: xs.length,
      first: avg(xs.slice(0, 3).map((x) => x.score)),
      last: avg(xs.slice(-3).map((x) => x.score)),
      high: xs.filter((x) => x.score >= 7).length,
      phone: data.logs.filter((l) => l.passportId === p.id && l.source === "phone").length,
      ticks: data.logs.filter((l) => l.passportId === p.id).length,
    };
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Proposed evaluation</h1>
          <p className="muted">Feasibility measures from the concept. <strong>No clinical effectiveness is claimed.</strong></p>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><span>Exercise-log completion</span><strong>{totExp ? Math.round((totDone / totExp) * 100) : 0}%</strong><small>{totDone} / {totExp} exercise-days</small></div>
        <div className="stat"><span>Patient usability (1–5)</span><strong>{fmt(ease)}</strong><small>{data.feedback.length} responses</small></div>
        <div className="stat"><span>Understood instructions</span><strong>{understood === null ? "—" : `${understood}%`}</strong><small>answered “yes”</small></div>
        <div className="stat"><span>Clinician time</span><strong className="sm">{fmt(setup, 0)} / {fmt(review, 0)} min</strong><small>new passport / review</small></div>
      </div>

      <div className="grid2 top">
        <section className="card">
          <h2>Completion by passport</h2>
          <table className="table">
            <thead><tr><th>Patient</th><th>Version</th><th>Days</th><th>Completion</th></tr></thead>
            <tbody>
              {perPassport.map(({ p, patient, a }) => (
                <tr key={p.id}>
                  <td>{patient?.code}</td>
                  <td>v{p.version}</td>
                  <td>{p.items.length ? a.expected / p.items.length : 0}</td>
                  <td>
                    <div className="bar-row">
                      <div className="bar"><div style={{ width: `${a.pct ?? 0}%` }} className={(a.pct ?? 0) < 60 ? "low" : ""} /></div>
                      <span>{a.pct ?? 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card">
          <h2>Completion by exercise</h2>
          <table className="table">
            <thead><tr><th>Exercise</th><th>Completion</th></tr></thead>
            <tbody>
              {[...byExercise.entries()].map(([exId, v]) => {
                const pct = v.expected ? Math.round((v.done / v.expected) * 100) : 0;
                return (
                  <tr key={exId}>
                    <td>{findExercise(data, exId)?.name}</td>
                    <td>
                      <div className="bar-row">
                        <div className="bar"><div style={{ width: `${pct}%` }} className={pct < 60 ? "low" : ""} /></div>
                        <span>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="muted small">Average time to update an existing plan: {fmt(update_, 0)} min.</p>
        </section>
      </div>

      <section className="card">
        <h2>Safety monitoring &amp; channel use</h2>
        <p className="muted small">Pain is recorded to spot problems early, not to claim the exercises work.</p>
        <table className="table">
          <thead><tr><th>Patient</th><th>Version</th><th>Pain reports</th><th>Pain: first 3 → last 3</th><th>Reports ≥ 7</th><th>Ticks from phone</th></tr></thead>
          <tbody>
            {painRows.map(({ p, patient, n, first, last, high, phone, ticks }) => (
              <tr key={p.id}>
                <td>{patient?.code}</td>
                <td>v{p.version}</td>
                <td>{n}</td>
                <td>{fmt(first)} → {fmt(last)}</td>
                <td>{high ? <span className="pill danger">{high}</span> : 0}</td>
                <td>{ticks ? `${Math.round((phone / ticks) * 100)}%` : "—"} <span className="muted small">({phone}/{ticks})</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid2 top">
        <form
          className="card form"
          onSubmit={(e) => {
            e.preventDefault();
            update((d) => ({ ...d, clinic }));
          }}
        >
          <h2>Clinic details (printed on passports)</h2>
          <label>Therapist<input value={clinic.therapist} onChange={(e) => setClinic({ ...clinic, therapist: e.target.value })} /></label>
          <label>Clinic / institution<input value={clinic.clinic} onChange={(e) => setClinic({ ...clinic, clinic: e.target.value })} /></label>
          <label>Contact phone<input value={clinic.phone} onChange={(e) => setClinic({ ...clinic, phone: e.target.value })} /></label>
          <div className="actions"><button className="btn primary" type="submit">Save</button></div>
        </form>
        <section className="card">
          <h2>Data</h2>
          <p className="muted small">Data is stored in the clinic database for your account. Export it for analysis, or replace everything with the demo patients.</p>
          <div className="row-gap">
            <button type="button" className="btn" onClick={exportCsv}>Export log (CSV)</button>
            <button type="button" className="btn" onClick={exportJson}>Export all (JSON)</button>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                if (confirm("Replace all data with the demo patients?")) {
                  reset();
                }
              }}
            >
              Reset demo data
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
