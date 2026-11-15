"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Figure from "@/components/Figure";
import Icon from "@/components/Icon";
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

  if (!patient) {
    return (
      <div className="card empty">
        <strong>Patient not found</strong>
        <Link href="/patients" className="btn">Back to patients</Link>
      </div>
    );
  }

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
      <Link href={`/patients/${id}`} className="crumb"><Icon name="back" size={16} />{patient.code}</Link>
      <div className="page-head">
        <div>
          <h1>{current ? `Update passport, v${current.version} to v${current.version + 1}` : "Create passport"}</h1>
          <p>{patient.code}, {patient.condition}</p>
        </div>
      </div>

      <ol className="stepper" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? "on" : i < step ? "done" : ""} aria-current={i === step ? "step" : undefined}>
            <button type="button" disabled={i > step && !items.length} onClick={() => (i < step || (i > step && items.length) ? goTo(i) : null)}>
              <span>{i < step ? <Icon name="check" size={16} /> : i + 1}</span>
              <b className="label">{s}</b>
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="card">
          <div className="card-head"><h2>Assess: choose suitable exercises</h2></div>
          <label className="block">
            Assessment summary
            <textarea rows={2} value={assessment} onChange={(e) => setAssessment(e.target.value)}
              placeholder="Key findings that justify this plan" />
          </label>
          <div className="chips" role="group" aria-label="Body area">
            {areas.map((a) => (
              <button key={a} type="button" className={a === filter ? "chip on" : "chip"} aria-pressed={a === filter} onClick={() => setFilter(a)}>{a === "All" ? "All areas" : a}</button>
            ))}
          </div>
          <div className="ex-grid">
            {exercises.filter((e) => filter === "All" || e.area === filter).map((e) => (
              <button key={e.id} type="button" className={selected.has(e.id) ? "ex on" : "ex"} aria-pressed={selected.has(e.id)} onClick={() => toggle(e.id)}>
                <span className="tick" aria-hidden="true">{selected.has(e.id) ? <Icon name="check" size={16} /> : <Icon name="plus" size={16} />}</span>
                <span className="ex-fig">{e.builtin ? <Figure exerciseId={e.id} frame={1} height={90} /> : <span className="muted small">Custom</span>}</span>
                <strong>{e.name}</strong>
                <small>{e.pa ? <span lang="pa">{e.pa.name}</span> : null}{e.pa ? ", " : ""}{e.area}{e.builtin ? "" : ", custom"}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card">
          <div className="card-head"><h2>Personalize: dose and safety advice</h2></div>
          {items.map((it) => {
            const ex = findExercise(data, it.exerciseId)!;
            return (
              <div key={it.id} className="dose-row">
                <div className="dose-head">
                  {ex.builtin && <span className="mini"><Figure exerciseId={ex.id} frame={1} height={56} /></span>}
                  <div>
                    <h3>{ex.name}</h3>
                    <p className="muted small">Prints as: <strong>{doseText(it)}</strong></p>
                  </div>
                </div>
                <div className="grid4">
                  <NumStep label="Sets" value={it.sets} onChange={(v) => patch(it.id, { sets: v })} />
                  <NumStep label="Reps" value={it.reps} onChange={(v) => patch(it.id, { reps: v })} />
                  <NumStep label="Times a day" value={it.perDay} onChange={(v) => patch(it.id, { perDay: v })} />
                  <label>Hold or tempo<input value={it.hold} placeholder="e.g. hold 5 s" onChange={(e) => patch(it.id, { hold: e.target.value })} /></label>
                </div>
                <div className="grid2">
                  <label className="block">Precautions<textarea rows={2} value={it.precautions} onChange={(e) => patch(it.id, { precautions: e.target.value })} /></label>
                  <label className="block">Note for patient (optional)<textarea rows={2} value={it.notes} onChange={(e) => patch(it.id, { notes: e.target.value })} /></label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <div className="card-head"><h2>Demonstrate: QR page and printed guidance</h2></div>
          <p className="muted">
            Each QR opens a phone page with an animated demonstration of the exercise, the steps and the dose. A video is optional: keep the
            library&apos;s public video, replace it with your own recording (ideally in the patient&apos;s language), or clear it. Patients without a
            smartphone use the printed pictures and text.
          </p>
          {items.map((it) => {
            const ex = findExercise(data, it.exerciseId)!;
            return (
              <div key={it.id} className="demo-row">
                <Qr value={origin ? exerciseUrl(origin, it, ex, patient.language) : "about:blank"} size={96} />
                <div className="grow">
                  <h3>{ex.name}</h3>
                  <label className="block">
                    Video link (optional)
                    <input type="url" value={it.videoUrl} placeholder="https://youtu.be/…" onChange={(e) => patch(it.id, { videoUrl: e.target.value })} />
                  </label>
                  {origin && (
                    <a className="small" href={exerciseUrl(origin, it, ex, patient.language)} target="_blank" rel="noreferrer">Preview the patient&apos;s page (opens in a new tab)</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <div className="card-head"><h2>Confirm the passport</h2></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th scope="col">Exercise</th><th scope="col">Dose</th><th scope="col">Precautions</th><th scope="col">Video</th></tr></thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td><strong>{findExercise(data, it.exerciseId)?.name}</strong></td>
                    <td>{doseText(it)}</td>
                    <td className="small">{it.precautions}</td>
                    <td>{it.videoUrl ? "Yes" : <span className="muted">Animation and text</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid2 confirm-fields">
            <label>
              Next follow-up visit (date and time)
              <input type="datetime-local" value={nextVisit} onChange={(e) => setNextVisit(e.target.value)} />
              <span className="hint">Printed on the passport and shown on the patient&apos;s phone with a countdown. The paper tick grid runs up to this date.</span>
            </label>
            <label>
              Clinician time on this passport (minutes)
              <input type="number" inputMode="numeric" min={0} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
              <span className="hint">Pre-filled from the time this page was open. Recorded for the feasibility evaluation.</span>
            </label>
          </div>
          {current && (
            <p className="muted small">Saving replaces v{current.version}. Its log history is kept.</p>
          )}
        </div>
      )}

      <div className="actions sticky">
        {step > 0 && <button className="btn" type="button" onClick={() => goTo(step - 1)}><Icon name="back" size={18} />Back</button>}
        <span className="grow" />
        <span className="muted small" role="status">{items.length} {items.length === 1 ? "exercise" : "exercises"} selected</span>
        {step < 3 ? (
          <button className="btn primary" type="button" disabled={!canNext} onClick={() => goTo(step + 1)}>Next: {STEPS[step + 1]}</button>
        ) : (
          <button className="btn primary" type="button" onClick={save}>Save and print passport</button>
        )}
      </div>
    </>
  );
}

/** A number field with large minus and plus buttons, easier than typing on a tablet. */
function NumStep({ label, value, onChange, min = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <label>
      {label}
      <span className="num-step">
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
        <input type="number" inputMode="numeric" min={min} value={value} onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))} />
        <button type="button" aria-label={`More ${label.toLowerCase()}`} onClick={() => onChange(value + 1)}>+</button>
      </span>
    </label>
  );
}
