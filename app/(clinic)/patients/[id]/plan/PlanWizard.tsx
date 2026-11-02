"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Qr from "@/components/Qr";
import { activePassport, allExercises, dateKey, defaultVisit, doseText, findExercise, uid } from "@/lib/logic";
import { exerciseUrl } from "@/lib/share";
import { useStore } from "@/lib/store";
import type { PassportItem } from "@/lib/types";

const STEPS = ["Assess", "Personalize", "Demonstrate", "Confirm"];

// Called from click handlers only; pre-fills clinician time for the evaluation.
function minutesSince(t: number): number {
  return Math.max(1, Math.round((Date.now() - t) / 60000));
}

export default function PlanWizard({ id }: { id: string }) {
  const { data, update } = useStore();
  const router = useRouter();
  const patient = data.patients.find((p) => p.id === id);
  const current = activePassport(data, id);

  const [step, setStep] = useState(0);
  const [assessment, setAssessment] = useState(current?.assessment ?? "");
  const [items, setItems] = useState<PassportItem[]>(() =>
    current ? current.items.map((it) => ({ ...it, id: uid() })) : [],
  );
  const [filter, setFilter] = useState("All");
  const [startedAt] = useState(() => Date.now());
  const [minutes, setMinutes] = useState("");
  const [nextVisit, setNextVisit] = useState(() =>
    current?.nextVisit && current.nextVisit.slice(0, 10) > dateKey() ? current.nextVisit : defaultVisit(),
  );
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- window is only available after mount
    setOrigin(window.location.origin);
  }, []);

  const exercises = allExercises(data);
  const areas = useMemo(() => ["All", ...Array.from(new Set(exercises.map((e) => e.area)))], [exercises]);

  if (!patient) return <p>Patient not found. <Link href="/">Back</Link></p>;

  const selected = new Set(items.map((i) => i.exerciseId));

  function toggle(exId: string) {
    if (selected.has(exId)) {
      setItems(items.filter((i) => i.exerciseId !== exId));
    } else {
      const ex = exercises.find((e) => e.id === exId)!;
      setItems([
        ...items,
        { id: uid(), exerciseId: exId, sets: 2, reps: 10, perDay: 1, hold: "", precautions: ex.precautions, videoUrl: ex.videoUrl ?? "", notes: "" },
      ]);
    }
  }

  function patch(itemId: string, change: Partial<PassportItem>) {
    setItems(items.map((i) => (i.id === itemId ? { ...i, ...change } : i)));
  }

  function goTo(n: number) {
    if (n === 3 && !minutes) setMinutes(String(minutesSince(startedAt)));
    setStep(n);
  }

  function save() {
    const today = dateKey();
    const passportId = uid();
    update((d) => {
      const versions = d.passports.filter((p) => p.patientId === id).map((p) => p.version);
      return {
        ...d,
        passports: [
          ...d.passports.map((p) =>
            p.patientId === id && p.status === "active" ? { ...p, status: "superseded" as const, endDate: today } : p,
          ),
          {
            id: passportId,
            patientId: id,
            version: versions.length ? Math.max(...versions) + 1 : 1,
            startDate: today,
            status: "active",
            assessment,
            setupMinutes: Number(minutes) || 0,
            nextVisit: nextVisit || undefined,
            items,
          },
        ],
      };
    });
    router.push(`/patients/${id}/print`);
  }

  const canNext = step === 0 ? items.length > 0 : true;

  return (
    <>
      <div className="page-head">
        <div>
          <Link href={`/patients/${id}`} className="muted small">← {patient.code}</Link>
          <h1>{current ? `Update passport (v${current.version} → v${current.version + 1})` : "Create passport"}</h1>
          <p className="muted">{patient.code} · {patient.condition}</p>
        </div>
      </div>

      <ol className="stepper">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? "on" : i < step ? "done" : ""}>
            <button type="button" onClick={() => (i < step || (i > step && items.length) ? goTo(i) : null)}>
              <span>{i + 1}</span>{s}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="card">
          <h2>1 · Assess — select suitable exercises</h2>
          <label className="block">
            Assessment summary
            <textarea rows={2} value={assessment} onChange={(e) => setAssessment(e.target.value)}
              placeholder="Key findings that justify this plan" />
          </label>
          <div className="chips">
            {areas.map((a) => (
              <button key={a} type="button" className={a === filter ? "chip on" : "chip"} onClick={() => setFilter(a)}>{a}</button>
            ))}
          </div>
          <div className="ex-grid">
            {exercises.filter((e) => filter === "All" || e.area === filter).map((e) => (
              <button key={e.id} type="button" className={selected.has(e.id) ? "ex on" : "ex"} onClick={() => toggle(e.id)}>
                <span className="tick">{selected.has(e.id) ? "✓" : "+"}</span>
                <strong>{e.name}</strong>
                <small>{e.area}{e.builtin ? "" : " · custom"}</small>
              </button>
            ))}
          </div>
          <p className="muted small">{items.length} selected</p>
        </div>
      )}

      {step === 1 && (
        <div className="card">
          <h2>2 · Personalize — dosage and safety instructions</h2>
          {items.map((it) => {
            const ex = findExercise(data, it.exerciseId)!;
            return (
              <div key={it.id} className="dose-row">
                <h3>{ex.name}</h3>
                <div className="grid4">
                  <label>Sets<input type="number" min={1} value={it.sets} onChange={(e) => patch(it.id, { sets: Number(e.target.value) })} /></label>
                  <label>Reps<input type="number" min={1} value={it.reps} onChange={(e) => patch(it.id, { reps: Number(e.target.value) })} /></label>
                  <label>Times a day<input type="number" min={1} value={it.perDay} onChange={(e) => patch(it.id, { perDay: Number(e.target.value) })} /></label>
                  <label>Hold / tempo<input value={it.hold} placeholder="e.g. hold 5 s" onChange={(e) => patch(it.id, { hold: e.target.value })} /></label>
                </div>
                <label className="block">Precautions<textarea rows={2} value={it.precautions} onChange={(e) => patch(it.id, { precautions: e.target.value })} /></label>
                <label className="block">Note for patient (optional)<input value={it.notes} onChange={(e) => patch(it.id, { notes: e.target.value })} /></label>
                <p className="muted small">Prints as: <strong>{doseText(it)}</strong></p>
              </div>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2>3 · Demonstrate — optional QR video + printed guidance</h2>
          <p className="muted">
            Library exercises come with a short public video. Replace it with your own recording (ideally in the patient&apos;s language), or clear it and the
            QR page still shows the written steps. Patients without a smartphone just use the printed text.
          </p>
          {items.map((it) => {
            const ex = findExercise(data, it.exerciseId)!;
            return (
              <div key={it.id} className="demo-row">
                <Qr value={origin ? exerciseUrl(origin, it, ex, patient.language) : "about:blank"} size={96} />
                <div className="grow">
                  <h3>{ex.name}</h3>
                  <label className="block">
                    Video link
                    <input value={it.videoUrl} placeholder="https://youtu.be/…" onChange={(e) => patch(it.id, { videoUrl: e.target.value })} />
                  </label>
                  {origin && (
                    <a className="small" href={exerciseUrl(origin, it, ex, patient.language)} target="_blank" rel="noreferrer">Preview patient page ↗</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h2>Confirm passport</h2>
          <table className="table">
            <thead><tr><th>Exercise</th><th>Dose</th><th>Precautions</th><th>Video</th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{findExercise(data, it.exerciseId)?.name}</strong></td>
                  <td>{doseText(it)}</td>
                  <td className="small">{it.precautions}</td>
                  <td>{it.videoUrl ? "Yes" : <span className="muted">Text only</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <label className="block inline">
            Next follow-up visit (date and time)
            <input type="datetime-local" value={nextVisit} onChange={(e) => setNextVisit(e.target.value)} style={{ width: 240 }} />
          </label>
          <p className="muted small">Printed on the passport and shown on the patient&apos;s phone with a countdown. The paper tick grid runs up to this date.</p>
          <label className="block inline">
            Clinician time spent on this passport (minutes)
            <input type="number" min={0} value={minutes} onChange={(e) => setMinutes(e.target.value)} style={{ width: 100 }} />
          </label>
          <p className="muted small">Pre-filled from the time this page was open. Recorded for the feasibility evaluation.</p>
          {current && (
            <p className="muted small">Saving replaces v{current.version}. Its log history is kept.</p>
          )}
        </div>
      )}

      <div className="actions sticky">
        {step > 0 && <button className="btn" type="button" onClick={() => goTo(step - 1)}>← Back</button>}
        <span className="grow" />
        {step < 3 ? (
          <button className="btn primary" type="button" disabled={!canNext} onClick={() => goTo(step + 1)}>Next →</button>
        ) : (
          <button className="btn primary" type="button" onClick={save}>Save & print passport</button>
        )}
      </div>
    </>
  );
}
