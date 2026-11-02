"use client";

import { useCallback, useEffect, useState } from "react";
import { T } from "@/components/Bi";
import ExerciseView, { sharedDose, sharedName } from "@/components/ExerciseView";
import Figure from "@/components/Figure";
import { dict, fmtDateIn, langs } from "@/lib/i18n";
import { dateKey, daysBetween, fmtTime, parseKey } from "@/lib/logic";
import type { PhonePost, PhoneView } from "@/lib/phone";
import type { Lang } from "@/lib/types";

function savedLang(fallback: Lang): Lang {
  try {
    return (localStorage.getItem("rp-phone:lang") as Lang) || fallback;
  } catch {
    return fallback;
  }
}

// The patient's own view, opened from the QR on the passport cover.
// Ticks and pain scores go straight to the clinic database.
export default function MyPassport({ token }: { token: string }) {
  const [view, setView] = useState<PhoneView | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "missing">("loading");
  const [lang, setLang] = useState<Lang>("en");
  const [open, setOpen] = useState<number | null>(null);
  const [today, setToday] = useState("");
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/phone/${token}`, { cache: "no-store" }).catch(() => null);
    if (!res) return setError(true);
    if (!res.ok) return setStatus("missing");
    const v = (await res.json()) as PhoneView;
    setView(v);
    setStatus("ok");
    setToday(dateKey());
    return v;
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch from the clinic server
    load().then((v) => v && setLang(savedLang(v.lang)));
    const onFocus = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, [load]);

  async function send(body: PhonePost, undo: () => void) {
    const res = await fetch(`/api/phone/${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    if (!res?.ok) {
      undo();
      setError(true);
    } else setError(false);
  }

  if (status === "missing") {
    return (
      <main className="patient">
        <div className="patient-card">
          <h1><T lang="both" k="badLink" /></h1>
          <p><T lang="both" k="badLinkBody" /></p>
        </div>
      </main>
    );
  }
  if (!view || !today) return <main className="patient"><p className="loading">…</p></main>;

  const v = view;
  const n = v.items.length;
  const l0 = langs(lang)[0];
  const doneOn = (date: string) => v.ticks.filter((t) => t.date === date).length;
  const isDoneToday = (itemId: string) => v.ticks.some((t) => t.itemId === itemId && t.date === today);
  const painToday = v.pain.find((x) => x.date === today)?.score ?? null;

  const elapsed = v.periodDays.filter((d) => d <= today);
  const done = v.ticks.filter((t) => t.date >= v.periodStart && t.date <= today).length;
  const expected = elapsed.length * n;
  const pct = expected ? Math.round((done / expected) * 100) : 0;
  const daysLeft = daysBetween(today, v.visit);
  const time = fmtTime(v.nextVisit);

  function toggle(itemId: string) {
    const was = isDoneToday(itemId);
    const flip = (on: boolean) =>
      setView((cur) =>
        cur && {
          ...cur,
          ticks: on
            ? [...cur.ticks, { itemId, date: today }]
            : cur.ticks.filter((t) => !(t.itemId === itemId && t.date === today)),
        },
      );
    flip(!was);
    send({ type: "tick", itemId, date: today, done: !was }, () => flip(was));
  }

  function setPain(score: number | null) {
    const before = v.pain;
    const next = v.pain.filter((x) => x.date !== today);
    setView({ ...v, pain: score === null ? next : [...next, { date: today, score }] });
    send({ type: "pain", date: today, score }, () => setView((cur) => cur && { ...cur, pain: before }));
  }

  function chooseLang(l: Lang) {
    setLang(l);
    try {
      localStorage.setItem("rp-phone:lang", l);
    } catch {
      // not saved: only this visit uses the choice
    }
  }

  return (
    <main className="patient">
      <header className="patient-band">
        <div className="band-row">
          <small><T lang={lang} k="brand" /> · {v.code}</small>
          <div className="lang-toggle" role="group" aria-label="Language">
            {(["pa", "both", "en"] as Lang[]).map((l) => (
              <button key={l} type="button" className={l === lang ? "on" : ""} onClick={() => chooseLang(l)}>
                {l === "pa" ? "ਪੰਜਾਬੀ" : l === "en" ? "English" : "ਦੋਵੇਂ / Both"}
              </button>
            ))}
          </div>
        </div>
        <h1><T lang={lang} k="today" /></h1>
        <p className="band-date" lang={l0}>{fmtDateIn(parseKey(today), l0, "long")}</p>
      </header>

      <div className="patient-card">
        {error && <p className="err center"><T lang={lang} k="offline" /></p>}

        <section className={daysLeft < 0 ? "visit-card overdue" : "visit-card"}>
          <small><T lang={lang} k="nextVisitIn" /></small>
          <strong lang={l0}>
            {fmtDateIn(parseKey(v.visit), l0, "long")}{time && `, ${time}`}
          </strong>
          <span>
            {daysLeft < 0 ? <T lang={lang} k="overdue" /> : daysLeft === 0 ? <T lang={lang} k="visitToday" /> : <>{daysLeft} <T lang={lang} k="daysLeft" /></>}
          </span>
          <div className="period-progress">
            <div className="bar"><div style={{ width: `${pct}%` }} /></div>
            <small><T lang={lang} k="periodProgress" />: {done} / {expected} ({pct}%)</small>
          </div>
          <div className="period-strip">
            {v.periodDays.map((d) => {
              const c = doneOn(d);
              const cls = d > today ? "dot future" : c >= n ? "dot full" : c > 0 ? "dot part" : "dot";
              return (
                <div key={d} className={d === today ? "week-day now" : "week-day"} title={d}>
                  <span className={d === v.visit ? `${cls} visit` : cls}>{d === v.visit ? "📅" : c >= n && d <= today ? "✓" : ""}</span>
                  <small lang={l0}>{fmtDateIn(parseKey(d), l0, "short-weekday").slice(0, 3)}</small>
                </div>
              );
            })}
          </div>
        </section>

        {doneOn(today) >= n && <div className="all-done"><T lang={lang} k="allDone" /></div>}

        <ul className="today-list">
          {v.items.map((ex, i) => {
            const on = isDoneToday(ex.itemId);
            return (
              <li key={ex.itemId} className={on ? "done" : ""}>
                <div className="today-row">
                  {ex.id && <div className="mini-fig"><Figure exerciseId={ex.id} height={60} frame={1} /></div>}
                  <div className="grow">
                    <strong>{sharedName(ex, lang)}</strong>
                    <div className="small muted">{sharedDose(ex, lang)}</div>
                    <button type="button" className="link small" onClick={() => setOpen(open === i ? null : i)}>
                      <T lang={lang} k={open === i ? "hideSteps" : "showSteps"} />
                    </button>
                  </div>
                  <button type="button" className={on ? "tick-btn on" : "tick-btn"} onClick={() => toggle(ex.itemId)} aria-pressed={on}>
                    {on ? "✓" : ""}
                    <span><T lang={lang} k={on ? "done" : "markDone"} /></span>
                  </button>
                </div>
                {open === i && <ExerciseView ex={ex} lang={lang} />}
              </li>
            );
          })}
        </ul>

        <section className="pain-card">
          <h2><T lang={lang} k="painToday" /></h2>
          <div className="pain-buttons" role="group" aria-label={dict(l0).painToday}>
            {Array.from({ length: 11 }, (_, s) => (
              <button
                key={s}
                type="button"
                className={`${painToday === s ? "on" : ""} lvl${s >= 7 ? 3 : s >= 4 ? 2 : 1}`}
                onClick={() => setPain(painToday === s ? null : s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="pain-ends small muted"><T lang={lang} k="painNone" /><T lang={lang} k="painWorst" /></div>
          {painToday !== null && painToday >= 7 && <p className="stop-box"><T lang={lang} k="painHigh" /></p>}
        </section>

        {v.phone && (
          <a className="btn block-btn" href={`tel:${v.phone.replace(/[^\d+]/g, "")}`}>📞 <T lang={lang} k="callTherapist" /></a>
        )}

        <div className="stop-box">
          <strong><T lang={lang} k="stopTitle" /></strong>
          <p><T lang={lang} k="stopBody" /></p>
        </div>
        <p className="muted small center">{v.therapist} · {v.clinic}</p>
      </div>
    </main>
  );
}
