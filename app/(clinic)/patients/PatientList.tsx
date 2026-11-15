"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import PatientTable from "@/components/PatientTable";
import { patientRows, type PatientRow } from "@/lib/overview";
import { useStore } from "@/lib/store";

const FILTERS: { id: string; label: string; test: (r: PatientRow) => boolean }[] = [
  { id: "", label: "All", test: () => true },
  { id: "attention", label: "Needs attention", test: (r) => r.overdue || r.highPain },
  { id: "pain", label: "Pain 7+", test: (r) => r.highPain },
  { id: "overdue", label: "Overdue visit", test: (r) => r.overdue },
  { id: "noplan", label: "No plan yet", test: (r) => !r.p },
];

export default function PatientList({ q, filter }: { q: string; filter: string }) {
  const { data } = useStore();
  const router = useRouter();
  const path = usePathname();
  const all = patientRows(data);
  const f = FILTERS.find((x) => x.id === filter) ?? FILTERS[0];
  const needle = q.trim().toLowerCase();
  const rows = all
    .filter(f.test)
    .filter((r) => !needle || [r.pt.code, r.pt.initials, r.pt.condition].some((s) => s.toLowerCase().includes(needle)))
    .sort((a, b) => a.pt.code.localeCompare(b.pt.code, undefined, { numeric: true }));

  const go = (next: { q?: string; f?: string }) => {
    const sp = new URLSearchParams();
    const nq = next.q ?? q;
    const nf = next.f ?? filter;
    if (nq) sp.set("q", nq);
    if (nf) sp.set("f", nf);
    router.replace(sp.size ? `${path}?${sp}` : path, { scroll: false });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Patients</h1>
          <p>{all.length} {all.length === 1 ? "patient" : "patients"}. Each one carries a paper passport; enter their ticks here at follow-up.</p>
        </div>
        <Link href="/patients/new" className="btn primary"><Icon name="plus" size={18} />New patient</Link>
      </div>

      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={18} />
          <span className="visually-hidden">Search patients</span>
          <input type="search" defaultValue={q} placeholder="Search by code, initials or condition" autoComplete="off"
            onChange={(e) => go({ q: e.target.value })} />
        </label>
        <div className="chips" role="group" aria-label="Filter patients">
          {FILTERS.map((x) => {
            const n = all.filter(x.test).length;
            return (
              <button key={x.id} type="button" className={f.id === x.id ? "chip on" : "chip"} aria-pressed={f.id === x.id} onClick={() => go({ f: x.id })}>
                {x.label} <span className="chip-n num">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card flush">
        <PatientTable
          rows={rows}
          empty={
            all.length === 0 ? (
              <><strong>No patients yet</strong><span>Add your first patient to make their passport.</span><Link href="/patients/new" className="btn primary">New patient</Link></>
            ) : (
              <><strong>No patients match</strong><span>Try another search or filter.</span><button type="button" className="btn" onClick={() => router.replace(path)}>Clear search</button></>
            )
          }
        />
      </div>
    </>
  );
}
