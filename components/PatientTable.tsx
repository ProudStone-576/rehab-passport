"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import { dateKey, fmtDate, fmtTime } from "@/lib/logic";
import type { PatientRow } from "@/lib/overview";

/** The patient table shared by the dashboard and the patient list. */
export default function PatientTable({ rows, empty }: { rows: PatientRow[]; empty: React.ReactNode }) {
  const today = dateKey();
  if (rows.length === 0) return <div className="empty">{empty}</div>;
  return (
    <table className="table patient-table">
      <thead>
        <tr>
          <th scope="col">Patient</th>
          <th scope="col">Condition</th>
          <th scope="col">Passport</th>
          <th scope="col">Last 7 days</th>
          <th scope="col">Next visit</th>
          <th scope="col"><span className="visually-hidden">Action</span></th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ pt, p, week, due, pain, overdue, highPain }) => (
          <tr key={pt.id}>
            <td data-label="Patient">
              <Link href={`/patients/${pt.id}`} className="strong-link">{pt.code}</Link>
              <div className="muted small">{pt.initials}{pt.age ? `, ${pt.age} y` : ""}</div>
            </td>
            <td data-label="Condition">
              {pt.condition}
              {highPain && <div><span className="pill danger"><Icon name="alert" size={14} />Pain {pain}/10 reported</span></div>}
            </td>
            <td data-label="Passport">{p ? <>v{p.version}, {p.items.length} exercises</> : <span className="muted">No plan yet</span>}</td>
            <td data-label="Last 7 days" className="col-bar">
              {week !== null ? (
                <div className="bar-row">
                  <div className="bar" aria-hidden="true"><div style={{ width: `${week}%` }} className={week < 60 ? "low" : ""} /></div>
                  <span>{week}%</span>
                </div>
              ) : (
                <span className="muted">None yet</span>
              )}
            </td>
            <td data-label="Next visit">
              {due ? (
                <span className={overdue ? "pill warn" : due === today ? "pill" : "pill quiet"}>
                  {overdue ? "Overdue, " : due === today ? "Today, " : ""}{fmtDate(due)}{p?.nextVisit ? `, ${fmtTime(p.nextVisit)}` : ""}
                </span>
              ) : (
                <span className="muted">Not booked</span>
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
      </tbody>
    </table>
  );
}
