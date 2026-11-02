import Link from "next/link";

const STEPS = [
  ["Assess", "Therapist selects suitable exercises from the approved library."],
  ["Personalize", "Adds dosage (sets, reps, times a day) and safety instructions."],
  ["Demonstrate", "Optional QR video + printed guidance. The QR opens a phone page — no app, no login."],
  ["Track", "Patient ticks daily on paper — or on their phone, which syncs straight to the clinic. Daily pain score 0–10 flags problems."],
  ["Review", "At the booked visit the therapist checks progress for that visit period, adjusts the plan and books the next visit."],
];

export default function About() {
  return (
    <div className="narrow">
      <h1>How the passport works</h1>
      <p className="muted">
        Home exercises may be forgotten, performed incorrectly, or be difficult to track between visits — and patients may
        have limited internet access or digital literacy. Rehab Passport is a simple paper exercise passport with optional
        QR-linked video demonstrations. This web app is the therapist&apos;s tool to create, print and review it.
      </p>
      <ol className="flow">
        {STEPS.map(([t, d], i) => (
          <li key={t}><span>{i + 1}</span><div><strong>{t}</strong><p>{d}</p></div></li>
        ))}
      </ol>
      <div className="card">
        <h2>What makes it different</h2>
        <ul>
          <li>Works on paper without a smartphone</li>
          <li>Optional short demonstration videos</li>
          <li>Therapist-approved exercise instructions</li>
          <li>Simple daily adherence log</li>
          <li>Low-cost and easy to reproduce — free hosting and database tiers, any browser</li>
        </ul>
      </div>
      <div className="card">
        <h2>Privacy by design</h2>
        <ul>
          <li>Patients are recorded by code and initials only.</li>
          <li>QR links contain only the exercise, dose and precautions — never patient details.</li>
          <li>Clinician accounts with password login; each therapist sees only their own patients.</li>
          <li>The patient&apos;s phone link is a long random secret. It shows only their current plan, never their name or diagnosis.</li>
        </ul>
      </div>
      <p className="key">
        <strong>Key message:</strong> innovation does not have to be expensive — clear instructions + accessible tracking
        can make home rehabilitation easier to organize.
      </p>
      <Link href="/" className="btn primary">Go to patients →</Link>
    </div>
  );
}
