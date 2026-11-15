"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import PatientTable from "@/components/PatientTable";
import { BUILTIN_EXERCISES } from "@/lib/exercises";
import { addDays, dateKey, fmtDate, fmtTime, parseKey } from "@/lib/logic";
import { patientRows, recentActivity } from "@/lib/overview";
import { useStore } from "@/lib/store";

export default function Dashboard() {
  const { data, me } = useStore();
  const router = useRouter();
  const today = dateKey();
  const rows = patientRows(data, today);

  const active = rows.filter((r) => r.p);
  const attention = active.filter((r) => r.overdue || r.highPain);
  const upcoming = active
    .filter((r) => r.due && r.due >= today && r.due <= addDays(today, 7))
    .sort((a, b) => ((a.p?.nextVisit ?? a.due!) < (b.p?.nextVisit ?? b.due!) ? -1 : 1));
  const dueSoon = active.filter((r) => r.due && r.due <= addDays(today, 3));
  const weeks = active.map((r) => r.week).filter((x): x is number => x !== null);
  const avg = weeks.length ? Math.round(weeks.reduce((a, b) => a + b, 0) / weeks.length) : null;
  const activity = recentActivity(data, 7);
  const longDate = parseKey(today).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <div className="page-head">
        <div>
          <p className="page-date">{longDate}</p>
          <h1>{me.demo ? "Demo clinic" : `Welcome back, ${me.name}`}</h1>
          <p>{me.demo ? "Sample patients that anyone can edit. Use your own account for real patients." : "Here is what needs you today."}</p>
        </div>
        <div className="head-actions">
          <form
            role="search"
            className="search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q")?.toString().trim();
              router.push(q ? `/patients?q=${encodeURIComponent(q)}` : "/patients");
            }}
          >
            <Icon name="search" size={18} />
            <input name="q" type="search" placeholder="Find a patient" aria-label="Find a patient" autoComplete="off" />
          </form>
          <Link href="/patients/new" className="btn primary"><Icon name="plus" size={18} />New patient</Link>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><span>Active passports</span><strong>{active.length}</strong></div>
        <div className="stat"><span>Average completion, 7 days</span><strong>{avg === null ? "None yet" : `${avg}%`}</strong></div>
        <div className="stat"><span>Visits in the next 3 days</span><strong>{dueSoon.length}</strong></div>
        <div className="stat"><span>Exercises in the library</span><strong>{BUILTIN_EXERCISES.length + data.exercises.length}</strong></div>
      </div>

      <section className="card attention" aria-labelledby="att-h">
        <div className="card-head">
          <h2 id="att-h">Needs attention</h2>
          <span className={attention.length ? "pill warn" : "pill ok"}>{attention.length ? `${attention.length} ${attention.length === 1 ? "patient" : "patients"}` : "All clear"}</span>
        </div>
        {attention.length === 0 ? (
          <p className="muted">No overdue visits and no pain score of 7 or more in the last 3 days.</p>
        ) : (
          <ul className="att-list">
            {attention.map((r) => (
              <li key={r.pt.id}>
                <Link href={`/patients/${r.pt.id}`} className="att-row">
                  <span className="att-code">{r.pt.code}</span>
                  <span className="att-why">
                    {r.highPain && <span className="pill danger"><Icon name="alert" size={14} />Pain {r.pain}/10 in the last 3 days</span>}
                    {r.overdue && <span className="pill warn">Visit overdue since {fmtDate(r.due!)}</span>}
                  </span>
                  <span className="att-cond muted">{r.pt.condition}</span>
                  <Icon name="arrow" size={18} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid2 top">
        <section className="card" aria-labelledby="up-h">
          <div className="card-head"><h2 id="up-h">Upcoming visits</h2><span className="muted small">Next 7 days</span></div>
          {upcoming.length === 0 ? (
            <p className="muted">No visits booked in the next 7 days. Book one from a patient&apos;s page.</p>
          ) : (
            <ul className="visit-list">
              {upcoming.map((r) => (
                <li key={r.pt.id}>
                  <span className={r.due === today ? "visit-day today" : "visit-day"}>
                    <strong>{r.due === today ? "Today" : parseKey(r.due!).toLocaleDateString(undefined, { weekday: "short" })}</strong>
                    <small>{parseKey(r.due!).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</small>
                  </span>
                  <span className="visit-who">
                    <Link href={`/patients/${r.pt.id}`} className="strong-link">{r.pt.code}</Link>
                    <small className="muted">{r.pt.condition}</small>
                  </span>
                  <span className="visit-time num">{r.p?.nextVisit ? fmtTime(r.p.nextVisit) : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-labelledby="act-h">
          <div className="card-head"><h2 id="act-h">Recent activity</h2><span className="muted small">Ticks, pain and reviews</span></div>
          {activity.length === 0 ? (
            <p className="muted">Nothing yet. Ticks from patients&apos; phones and the paper passport appear here.</p>
          ) : (
            <ul className="activity">
              {activity.map((a) => (
                <li key={a.key}>
                  <Link href={`/patients/${a.patientId}`} className="strong-link">{a.code}</Link>
                  <span>{a.text}</span>
                  {a.tag && <span className={`pill ${a.tag.tone}`}>{a.tag.label}</span>}
                  <small className="muted num">{a.date === today ? "Today" : fmtDate(a.date)}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card flush top-gap" aria-labelledby="pt-h">
        <div className="card-head">
          <h2 id="pt-h">Patients</h2>
          <Link href="/patients" className="link">See all patients</Link>
        </div>
        <PatientTable
          rows={[...rows].sort((a, b) => ((a.due ?? "9") < (b.due ?? "9") ? -1 : 1)).slice(0, 6)}
          empty={<><strong>No patients yet</strong><span>Add your first patient to make their passport.</span><Link href="/patients/new" className="btn primary">New patient</Link></>}
        />
      </section>
      <p className="muted small note">Use coded patients such as P-001. Never enter real names or identifiers.</p>
    </>
  );
}
