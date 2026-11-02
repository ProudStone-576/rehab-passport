"use client";

import { useState } from "react";
import AnimatedFigure from "@/components/AnimatedFigure";
import Figure from "@/components/Figure";
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

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Exercise library</h1>
          <p className="muted">
            Therapist-approved instructions in English and ਪੰਜਾਬੀ. Built-in exercises are illustrative examples for the prototype.
          </p>
        </div>
      </div>
      {error && <p className="err">{error}</p>}

      <div className="lib">
        <div>
          {areas.map((a) => (
            <section key={a} className="card">
              <h2>{a}</h2>
              <div className="lib-list">
                {list.filter((e) => e.area === a).map((e) => {
                  const photos = data.photos[e.id] ?? [];
                  return (
                    <details key={e.id} className="lib-item">
                      <summary>
                        <span>
                          <strong>{e.name}</strong>
                          {e.pa && <span className="muted pa-name" lang="pa"> · {e.pa.name}</span>}
                        </span>
                        <span className="row-gap">
                          {photos.length > 0 && <span className="pill">{photos.length} photo{photos.length > 1 ? "s" : ""}</span>}
                          <span className={e.builtin ? "pill" : "pill custom"}>{e.builtin ? "built-in" : "custom"}</span>
                        </span>
                      </summary>
                      <div className="lib-body">
                        {e.builtin && (
                          <div className="lib-figs">
                            <Figure exerciseId={e.id} height={100} labels={["Start", "End"]} />
                            <AnimatedFigure exerciseId={e.id} height={110} />
                          </div>
                        )}
                        <div className="grid2">
                          <ol className="steps">{e.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
                          {e.pa && <ol className="steps" lang="pa">{e.pa.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>}
                        </div>
                        <p className="small"><strong>Precautions:</strong> {e.precautions}</p>
                        {e.videoUrl && (
                          <p className="small">
                            <strong>Default video:</strong>{" "}
                            <a href={e.videoUrl} target="_blank" rel="noreferrer">{e.videoSource ?? e.videoUrl}</a>
                          </p>
                        )}
                        <div className="photo-row">
                          {photos.map((src, i) => (
                            <figure key={i}>
                              {/* eslint-disable-next-line @next/next/no-img-element -- local data URLs */}
                              <img src={src} alt={`${e.name} photo ${i + 1}`} />
                              <button type="button" className="link danger small" onClick={() => removePhoto(e.id, i)}>Remove</button>
                            </figure>
                          ))}
                          {photos.length < MAX_PHOTOS && (
                            <label className="photo-add">
                              + Add step photo
                              <input type="file" accept="image/*" multiple onChange={(ev) => { addPhotos(e.id, ev.target.files); ev.target.value = ""; }} />
                            </label>
                          )}
                        </div>
                        <p className="muted small">Photos replace the drawing on the printed passport. Take them in order: start → end.</p>
                        {!e.builtin && <button type="button" className="link danger" onClick={() => remove(e.id)}>Delete exercise</button>}
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <form className="card form sticky-side" onSubmit={add}>
          <h2>Add custom exercise</h2>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Body area
            <input list="areas" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Lower limb" />
            <datalist id="areas">{areas.map((a) => <option key={a} value={a} />)}</datalist>
          </label>
          <label>Steps (one per line)<textarea rows={4} value={steps} onChange={(e) => setSteps(e.target.value)} required /></label>
          <label>Precautions<textarea rows={3} value={precautions} onChange={(e) => setPrecautions(e.target.value)} required /></label>
          <label>Default video link (optional)<input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtu.be/…" /></label>
          <details className="pa-fields">
            <summary>ਪੰਜਾਬੀ translation (optional)</summary>
            <label>ਨਾਮ (name)<input lang="pa" value={paName} onChange={(e) => setPaName(e.target.value)} /></label>
            <label>ਤਰੀਕਾ (steps, one per line)<textarea lang="pa" rows={4} value={paSteps} onChange={(e) => setPaSteps(e.target.value)} /></label>
            <label>ਸਾਵਧਾਨੀਆਂ (precautions)<textarea lang="pa" rows={2} value={paPrec} onChange={(e) => setPaPrec(e.target.value)} /></label>
          </details>
          <p className="muted small">Custom exercises have no drawing — add step photos after saving.</p>
          <div className="actions"><button className="btn primary" type="submit">Add to library</button></div>
        </form>
      </div>
    </>
  );
}
