"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { useState } from "react";
import { dateKey, newToken, uid } from "@/lib/logic";
import { useStore } from "@/lib/store";
import type { Lang } from "@/lib/types";

export default function NewPatient() {
  const { data, update } = useStore();
  const router = useRouter();
  const nextCode = `P-${String(data.patients.length + 1).padStart(3, "0")}`;
  const [code, setCode] = useState(nextCode);
  const [initials, setInitials] = useState("");
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");
  const [language, setLanguage] = useState<Lang>("en");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = uid();
    update((d) => ({
      ...d,
      patients: [
        ...d.patients,
        { id, code: code.trim(), initials: initials.trim(), age: age ? Number(age) : undefined, condition: condition.trim(), language, createdAt: dateKey(), phoneToken: newToken() },
      ],
    }));
    router.push(`/patients/${id}/plan`);
  }

  const LANGS: { id: Lang; title: string; sample: React.ReactNode }[] = [
    { id: "en", title: "English", sample: "Sit-to-stand" },
    { id: "pa", title: "ਪੰਜਾਬੀ", sample: <span lang="pa">ਬੈਠ ਕੇ ਖੜ੍ਹੇ ਹੋਣਾ</span> },
    { id: "both", title: "Both", sample: <><span lang="pa">ਬੈਠ ਕੇ ਖੜ੍ਹੇ ਹੋਣਾ</span> / Sit-to-stand</> },
  ];

  return (
    <div className="narrow">
      <Link href="/patients" className="crumb"><Icon name="back" size={16} />Patients</Link>
      <div className="page-head">
        <div>
          <h1>New patient</h1>
          <p>Step 1 of 2. Next you choose their exercises.</p>
        </div>
      </div>
      <form className="card form" onSubmit={submit}>
        <div className="alert info">
          <Icon name="alert" />
          <p>Keep it pseudonymous. A code and initials are enough to match the paper passport. Never enter a full name or phone number.</p>
        </div>
        <div className="grid2">
          <label>
            Patient code
            <input name="code" value={code} onChange={(e) => setCode(e.target.value)} required autoComplete="off" />
            <span className="hint">Printed on the passport and phone page.</span>
          </label>
          <label>
            Initials
            <input name="initials" value={initials} onChange={(e) => setInitials(e.target.value)} placeholder="e.g. R.K." autoComplete="off" />
            <span className="hint">Only the clinic sees these.</span>
          </label>
        </div>
        <div className="grid2">
          <label>
            Condition or reason for referral
            <input name="condition" value={condition} onChange={(e) => setCondition(e.target.value)} required placeholder="e.g. Knee osteoarthritis" autoComplete="off" />
          </label>
          <label>
            Age
            <input name="age" type="number" inputMode="numeric" min={1} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
          </label>
        </div>
        <fieldset className="choice">
          <legend>Passport language <span className="hint">for the printout and the phone pages</span></legend>
          <div className="choice-grid">
            {LANGS.map((l) => (
              <label key={l.id} className={language === l.id ? "choice-card on" : "choice-card"}>
                <input type="radio" name="language" value={l.id} checked={language === l.id} onChange={() => setLanguage(l.id)} />
                <strong lang={l.id === "pa" ? "pa" : undefined}>{l.title}</strong>
                <small>{l.sample}</small>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="actions">
          <button className="btn primary" type="submit">Continue to the plan<Icon name="arrow" size={18} /></button>
          <Link href="/patients" className="btn">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
