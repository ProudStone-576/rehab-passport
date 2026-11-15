"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pair, T } from "@/components/Bi";
import Figure from "@/components/Figure";
import Icon from "@/components/Icon";
import Qr from "@/components/Qr";
import { dict, doseIn, exName, exPrecautions, exSteps, fmtDateIn, langs } from "@/lib/i18n";
import { activePassport, addDays, findExercise, fmtTime, parseKey, visitPeriod } from "@/lib/logic";
import { exerciseUrl } from "@/lib/share";
import { useStore } from "@/lib/store";

export default function PrintPassport({ id }: { id: string }) {
  const { data } = useStore();
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- window is only available after mount
    setOrigin(window.location.origin);
  }, []);

  const patient = data.patients.find((p) => p.id === id);
  const p = activePassport(data, id);
  if (!patient || !p) {
    return (
      <div className="page">
        <div className="card empty">
          <strong>No active passport to print</strong>
          <span>Create the patient&apos;s plan first.</span>
          <Link href={`/patients/${id}`} className="btn">Back to the patient</Link>
        </div>
      </div>
    );
  }

  const lang = patient.language;
  const ls = langs(lang);
  const fmt = (d: string) => fmtDateIn(parseKey(d), ls[0], "full");
  // Paper log covers this visit period: from the last visit to the next one (7–28 days).
  const period = visitPeriod(data, p);
  const span = Math.max(7, Math.min(28, period.days.length));
  const days = Array.from({ length: span }, (_, i) => addDays(period.start, i));
  const review = period.visit;
  const visitTime = fmtTime(p.nextVisit);
  const isLocal = origin.includes("localhost") || origin.includes("127.0.0.1");
  const items = p.items
    .map((item) => ({ item, ex: findExercise(data, item.exerciseId) }))
    .filter((x): x is { item: typeof x.item; ex: NonNullable<typeof x.ex> } => !!x.ex);
  const phoneLink = origin ? `${origin}/p/${patient.phoneToken}` : "";

  const opts = (k: "q1o" | "q2o" | "q3o") =>
    dict("en")[k].map((en, i) => <span key={en}><i /><Pair lang={lang} en={en} pa={dict("pa")[k][i]} /></span>);

  return (
    <div className="print-root">
      <div className="print-toolbar no-print">
        <Link href={`/patients/${id}`} className="btn"><Icon name="back" size={18} />Back</Link>
        <span className="grow muted small">
          A4, {lang === "en" ? "English" : lang === "pa" ? "Punjabi" : "Punjabi and English"}. Print it, or choose Save as PDF in the print window.{" "}
          {isLocal && "QR codes point to localhost: open the live site so phones can scan them."}
        </span>
        {phoneLink && <a className="btn" href={phoneLink} target="_blank" rel="noreferrer"><Icon name="phone" size={18} />Patient view</a>}
        <button className="btn primary" type="button" onClick={() => window.print()}><Icon name="print" size={18} />Print</button>
      </div>

      {/* Cover */}
      <section className="sheet cover">
        <div className="cover-band">
          <h1><T lang={lang} k="brand" /></h1>
          <p><T lang={lang} k="subtitle" /></p>
        </div>
        <div className="cover-body">
          <dl className="facts">
            <div><dt><T lang={lang} k="patient" /></dt><dd>{patient.code} {patient.initials && `(${patient.initials})`}</dd></div>
            <div><dt><T lang={lang} k="therapist" /></dt><dd>{data.clinic.therapist}</dd></div>
            <div><dt><T lang={lang} k="clinic" /></dt><dd>{data.clinic.clinic}</dd></div>
            {data.clinic.phone && <div><dt><T lang={lang} k="phone" /></dt><dd>{data.clinic.phone}</dd></div>}
            <div><dt><T lang={lang} k="planVersion" /></dt><dd>v{p.version}, <T lang={lang} k="started" /> {fmt(p.startDate)}</dd></div>
            <div className="visit-fact"><dt><T lang={lang} k="nextReview" /></dt><dd>{fmt(review)}{visitTime && `, ${visitTime}`}</dd></div>
          </dl>

          <h2><T lang={lang} k="howTo" /></h2>
          <ol className="howto">
            {(["how1", "how2", "how3", "how4"] as const).map((k) => (
              <li key={k}>
                {ls.map((l) => (
                  <div key={l} lang={l} className={l === "en" && ls.length > 1 ? "secondary" : ""}>
                    <strong>{dict(l)[k][0]}</strong> {dict(l)[k][1]}
                  </div>
                ))}
              </li>
            ))}
          </ol>

          <div className="stop-box">
            {ls.map((l) => (
              <p key={l} lang={l} className={l === "en" && ls.length > 1 ? "secondary" : ""}>
                <strong>{dict(l).stopTitle}</strong> {dict(l).stopBody}
              </p>
            ))}
          </div>

          {phoneLink && (
            <div className="phone-qr">
              <Qr value={phoneLink} size={110} />
              <p><T lang={lang} k="phoneQr" /></p>
            </div>
          )}
        </div>
      </section>

      {/* Exercise pages, matching the poster's prototype columns */}
      <section className="sheet">
        <h2 className="sheet-title"><T lang={lang} k="myExercises" /> <span>{patient.code}, v{p.version}</span></h2>
        {items.map(({ item: it, ex }, n) => {
          const photos = data.photos[ex.id] ?? [];
          return (
            <article key={it.id} className="px">
              <div className="px-top">
                <div className="px-main">
                  <h3><span className="num">{n + 1}</span><Pair lang={lang} en={ex.name} pa={exName(ex, "pa")} /></h3>
                  {photos.length > 0 ? (
                    <div className="px-photos">
                      {/* eslint-disable-next-line @next/next/no-img-element -- local data URLs */}
                      {photos.map((src, i) => <img key={i} src={src} alt={`${ex.name} step ${i + 1}`} />)}
                    </div>
                  ) : (
                    <div className="px-fig"><Figure exerciseId={ex.id} height={104} /></div>
                  )}
                  {ls.map((l) => (
                    <ol key={l} lang={l} className={l === "en" && ls.length > 1 ? "steps secondary" : "steps"}>
                      {exSteps(ex, l).map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                  ))}
                  {it.notes && <p className="px-note">{it.notes}</p>}
                </div>
                <div className="px-qr">
                  {origin && <Qr value={exerciseUrl(origin, it, ex, lang)} size={88} />}
                  <small><T lang={lang} k={it.videoUrl ? "scanVideo" : "scanSteps"} /></small>
                </div>
              </div>
              <div className="px-cols">
                <div className="px-dose">
                  <h4><T lang={lang} k="dose" /></h4>
                  <p><Pair lang={lang} en={doseIn(it, "en")} pa={doseIn(it, "pa")} /></p>
                </div>
                <div>
                  <h4><T lang={lang} k="precautions" /></h4>
                  {ls.map((l) => (
                    <p key={l} lang={l} className={l === "en" && ls.length > 1 ? "secondary" : ""}>{exPrecautions(ex, it.precautions, l)}</p>
                  ))}
                </div>
              </div>
              <div className="px-log">
                <h4><T lang={lang} k="dailyLog" /></h4>
                <div className="ticks" style={{ gridTemplateColumns: `repeat(${Math.min(days.length, 14)}, 1fr)` }}>
                  {days.map((d) => (
                    <div key={d} className="tickcell">
                      <span>{fmtDateIn(parseKey(d), ls[0], "short-weekday")}</span>
                      <span>{parseKey(d).getDate()}</span>
                      <i />
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-review"><h4><T lang={lang} k="clinicianReview" /></h4><div className="line" /></div>
            </article>
          );
        })}
        <article className="px pain-sheet">
          <h4><T lang={lang} k="painLog" /></h4>
          <p className="small"><T lang={lang} k="painHelp" /></p>
          <div className="ticks" style={{ gridTemplateColumns: `repeat(${Math.min(days.length, 14)}, 1fr)` }}>
            {days.map((d) => (
              <div key={d} className="tickcell">
                <span>{fmtDateIn(parseKey(d), ls[0], "short-weekday")}</span>
                <span>{parseKey(d).getDate()}</span>
                <i className="num-box" />
              </div>
            ))}
          </div>
          <div className="pain-scale">
            {Array.from({ length: 11 }, (_, n) => <span key={n} className={n >= 7 ? "high" : ""}>{n}</span>)}
          </div>
        </article>
      </section>

      {/* Feedback page used in the feasibility evaluation */}
      <section className="sheet">
        <h2 className="sheet-title"><T lang={lang} k="feedback" /> <span><T lang={lang} k="feedbackSub" /></span></h2>
        <div className="fb">
          <p><T lang={lang} k="q1" /></p>
          <div className="fb-scale">{opts("q1o")}</div>
          <p><T lang={lang} k="q2" /></p>
          <div className="fb-scale">{opts("q2o")}</div>
          <p><T lang={lang} k="q3" /></p>
          <div className="fb-scale">{opts("q3o")}</div>
          <p><T lang={lang} k="q4" /></p>
          <div className="line" /><div className="line" /><div className="line" />
        </div>
        <p className="print-foot"><T lang={lang} k="footer" /></p>
      </section>
    </div>
  );
}
