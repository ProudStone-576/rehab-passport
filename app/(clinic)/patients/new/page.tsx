"use client";

import { useRouter } from "next/navigation";
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

  return (
    <div className="narrow">
      <h1>New patient</h1>
      <p className="muted">Keep it pseudonymous: a code and initials are enough to match the paper passport.</p>
      <form className="card form" onSubmit={submit}>
        <label>
          Patient code
          <input value={code} onChange={(e) => setCode(e.target.value)} required />
        </label>
        <div className="grid2">
          <label>
            Initials
            <input value={initials} onChange={(e) => setInitials(e.target.value)} placeholder="e.g. R.K." />
          </label>
          <label>
            Age
            <input type="number" min={1} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
          </label>
        </div>
        <label>
          Condition / reason for referral
          <input value={condition} onChange={(e) => setCondition(e.target.value)} required placeholder="e.g. Knee osteoarthritis" />
        </label>
        <label>
          Passport language (printout and phone pages)
          <select value={language} onChange={(e) => setLanguage(e.target.value as Lang)}>
            <option value="en">English</option>
            <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
            <option value="both">Both — ਪੰਜਾਬੀ + English</option>
          </select>
        </label>
        <div className="actions">
          <button className="btn primary" type="submit">Continue to passport →</button>
        </div>
      </form>
    </div>
  );
}
