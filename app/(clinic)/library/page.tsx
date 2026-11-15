"use client";

import { useState } from "react";
import AnimatedFigure from "@/components/AnimatedFigure";
import Figure from "@/components/Figure";
import Icon from "@/components/Icon";
import { allExercises, uid } from "@/lib/logic";
import { useStore } from "@/lib/store";
import type { Exercise } from "@/lib/types";

const MAX_PHOTOS = 3;

// Shrink a photo to max 640 px JPEG so a few dozen fit in browser storage.
function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 640 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function Library() {
  const { data, update } = useStore();
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [steps, setSteps] = useState("");
  const [precautions, setPrecautions] = useState(
    "Stop and tell your therapist if you feel sharp or worsening pain, dizziness, chest pain or new swelling.",
  );
  const [videoUrl, setVideoUrl] = useState("");
  const [paName, setPaName] = useState("");
  const [paSteps, setPaSteps] = useState("");
  const [paPrec, setPaPrec] = useState("");
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [areaF, setAreaF] = useState("");
  const [selected, setSelected] = useState("");
  const [adding, setAdding] = useState(false);

  const list = allExercises(data);
  const areas = Array.from(new Set(list.map((e) => e.area)));

  function add(e: React.FormEvent) {
    e.preventDefault();
    const lines = (t: string) => t.split("\n").map((s) => s.trim()).filter(Boolean);
    const ex: Exercise = {
      id: uid(),
      name: name.trim(),
      area: area.trim() || "Other",
      steps: lines(steps),
      precautions: precautions.trim(),
      videoUrl: videoUrl.trim() || undefined,
    };
    if (paName.trim()) ex.pa = { name: paName.trim(), steps: lines(paSteps), precautions: paPrec.trim() };
    update((d) => ({ ...d, exercises: [...d.exercises, ex] }));
    setName("");
    setSteps("");
    setVideoUrl("");
    setPaName("");
    setPaSteps("");
    setPaPrec("");
  }

  function remove(id: string) {
    const used = data.passports.some((p) => p.items.some((i) => i.exerciseId === id));
    if (used) return alert("This exercise is used in a passport and cannot be deleted.");
    update((d) => ({ ...d, exercises: d.exercises.filter((x) => x.id !== id) }));
  }

  async function addPhotos(exId: string, files: FileList | null) {
    if (!files?.length) return;
    setError("");
    try {
      const have = data.photos[exId]?.length ?? 0;
      const picked = Array.from(files).slice(0, MAX_PHOTOS - have);
      const urls = await Promise.all(picked.map(compress));
      update((d) => ({ ...d, photos: { ...d.photos, [exId]: [...(d.photos[exId] ?? []), ...urls] } }));
    } catch {
      setError("Could not read that image.");
    }
  }

  function removePhoto(exId: string, i: number) {
    update((d) => ({ ...d, photos: { ...d.photos, [exId]: (d.photos[exId] ?? []).filter((_, j) => j !== i) } }));
  }

  const needle = q.trim().toLowerCase();
  const shown = list.filter(
    (e) => (!areaF || e.area === areaF) && (!needle || [e.name, e.pa?.name ?? "", e.area].some((t) => t.toLowerCase().includes(needle))),
  );
  const sel = list.find((e) => e.id === selected);
  const photosOf = (id: string) => data.photos[id] ?? [];

  function open(id: string) {
    setSelected(id);
    setAdding(false);
    // On narrow screens the panel sits below the grid; bring it into view.
    if (window.matchMedia("(max-width: 60rem)").matches) {
      requestAnimationFrame(() => document.getElementById("lib-panel")?.scrollIntoView({ block: "start" }));
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Exercise library</h1>
          <p>Therapist-approved instructions in English and <span lang="pa">ਪੰਜਾਬੀ</span>. Built-in exercises are illustrative examples for the prototype.</p>
        </div>
        <button type="button" className="btn primary" onClick={() => { setAdding(true); setSelected(""); }}>
          <Icon name="plus" size={18} />Add custom exercise
        </button>
      </div>
      {error && <p className="err" role="alert">{error}</p>}

      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={18} />
          <span className="visually-hidden">Search exercises</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search in English or Punjabi" autoComplete="off" />
        </label>
        <div className="chips" role="group" aria-label="Body area">
          {["", ...areas].map((a) => (
            <button key={a || "all"} type="button" className={areaF === a ? "chip on" : "chip"} aria-pressed={areaF === a} onClick={() => setAreaF(a)}>
              {a || "All areas"}
            </button>
          ))}
        </div>
      </div>

      <div className="lib">
        <div>
          {shown.length === 0 ? (
            <div className="card empty">
              <strong>No exercises match</strong>
              <span>Try another word, or add it as a custom exercise.</span>
              <button type="button" className="btn" onClick={() => { setQ(""); setAreaF(""); }}>Clear search</button>
            </div>
          ) : (
            <ul className="lib-grid">
              {shown.map((e) => {
                const photos = photosOf(e.id);
                return (
                  <li key={e.id}>
                    <button type="button" className={selected === e.id ? "lib-card on" : "lib-card"} aria-pressed={selected === e.id} onClick={() => open(e.id)}>
                      <span className="lib-fig">
                        {e.builtin ? (
                          <Figure exerciseId={e.id} height={84} />
                        ) : photos[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element -- local data URLs
                          <img src={photos[0]} alt="" />
                        ) : (
                          <span className="muted small">No drawing</span>
                        )}
                      </span>
                      <span className="lib-names">
                        <strong>{e.name}</strong>
                        {e.pa ? <span lang="pa">{e.pa.name}</span> : <span className="muted small">No Punjabi yet</span>}
                      </span>
                      <span className="lib-meta">
                        <span className="pill quiet">{e.area}</span>
                        {!e.builtin && <span className="pill custom">custom</span>}
                        {photos.length > 0 && <span className="pill">{photos.length} photo{photos.length > 1 ? "s" : ""}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside id="lib-panel" className="sticky-side" aria-live="polite">
          {adding || !sel ? (
            <form className="card form" onSubmit={(e) => { add(e); setAdding(false); }}>
              <div className="card-head">
                <h2>Add custom exercise</h2>
              </div>
              {!adding && <p className="muted small">Or choose an exercise on the left to see its animation, steps and photos.</p>}
              <label>Name<input name="name" value={name} onChange={(e) => setName(e.target.value)} required /></label>
              <label>Body area
                <input name="area" list="areas" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Lower limb" />
                <datalist id="areas">{areas.map((a) => <option key={a} value={a} />)}</datalist>
              </label>
              <label>Steps<span className="hint">One per line.</span><textarea name="steps" rows={4} value={steps} onChange={(e) => setSteps(e.target.value)} required /></label>
              <label>Precautions<textarea name="precautions" rows={3} value={precautions} onChange={(e) => setPrecautions(e.target.value)} required /></label>
              <label>Default video link (optional)<input name="videoUrl" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtu.be/…" /></label>
              <details className="pa-fields">
                <summary><span lang="pa">ਪੰਜਾਬੀ</span>&nbsp;translation (optional)</summary>
                <label><span lang="pa">ਨਾਮ</span> (name)<input lang="pa" value={paName} onChange={(e) => setPaName(e.target.value)} /></label>
                <label><span lang="pa">ਤਰੀਕਾ</span> (steps, one per line)<textarea lang="pa" rows={4} value={paSteps} onChange={(e) => setPaSteps(e.target.value)} /></label>
                <label><span lang="pa">ਸਾਵਧਾਨੀਆਂ</span> (precautions)<textarea lang="pa" rows={2} value={paPrec} onChange={(e) => setPaPrec(e.target.value)} /></label>
                <p className="hint">Have a Punjabi speaker and a physiotherapist check any translation before it reaches patients.</p>
              </details>
              <p className="muted small">Custom exercises have no drawing. Add step photos after saving.</p>
              <div className="actions"><button className="btn primary" type="submit">Add to library</button></div>
            </form>
          ) : (
            <section className="card lib-detail" aria-labelledby="lib-detail-h">
              <div className="card-head">
                <div>
                  <h2 id="lib-detail-h">{sel.name}</h2>
                  {sel.pa && <p lang="pa" className="muted">{sel.pa.name}</p>}
                </div>
                <button type="button" className="btn small" onClick={() => setSelected("")}>Close</button>
              </div>
              {sel.builtin && (
                <div className="lib-figs">
                  <AnimatedFigure exerciseId={sel.id} height={150} />
                  <Figure exerciseId={sel.id} height={70} labels={["Start", "End"]} />
                </div>
              )}
              <h3>Steps</h3>
              <ol className="steps">{sel.steps.map((t, i) => <li key={i}>{t}</li>)}</ol>
              {sel.pa && <ol className="steps" lang="pa">{sel.pa.steps.map((t, i) => <li key={i}>{t}</li>)}</ol>}
              <h3>Precautions</h3>
              <p className="small">{sel.precautions}</p>
              {sel.pa?.precautions && <p className="small" lang="pa">{sel.pa.precautions}</p>}
              {sel.videoUrl && (
                <p className="small">
                  <strong>Default video:</strong>{" "}
                  <a href={sel.videoUrl} target="_blank" rel="noreferrer">{sel.videoSource ?? sel.videoUrl}</a>
                </p>
              )}
              <h3>Step photos</h3>
              <div className="photo-row">
                {photosOf(sel.id).map((src, i) => (
                  <figure key={i}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- local data URLs */}
                    <img src={src} alt={`${sel.name} photo ${i + 1}`} />
                    <button type="button" className="link danger small" onClick={() => removePhoto(sel.id, i)}>Remove</button>
                  </figure>
                ))}
                {photosOf(sel.id).length < MAX_PHOTOS && (
                  <label className="photo-add">
                    Add step photo
                    <input type="file" accept="image/*" multiple onChange={(ev) => { addPhotos(sel.id, ev.target.files); ev.target.value = ""; }} />
                  </label>
                )}
              </div>
              <p className="muted small">Photos replace the drawing on the printed passport. Take them in order, from start to end.</p>
              {!sel.builtin && <button type="button" className="link danger" onClick={() => { remove(sel.id); setSelected(""); }}>Delete exercise</button>}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
