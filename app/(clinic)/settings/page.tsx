"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { useStore } from "@/lib/store";

// Clinic details printed on every passport and phone page, plus account data.
export default function Settings() {
  const { data, update, reset, me } = useStore();
  const [clinic, setClinic] = useState(data.clinic);
  const [toast, setToast] = useState("");
  const placeholder = /your name/i.test(data.clinic.therapist) || !data.clinic.therapist.trim();

  function say(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  return (
    <div className="narrow">
      <div className="page-head">
        <div>
          <h1>Clinic settings</h1>
          <p>Signed in as {me.demo ? "the shared demo clinic" : me.email}.</p>
        </div>
      </div>

      {placeholder && (
        <div className="alert warn top-space">
          <Icon name="alert" />
          <p><strong>The therapist name is still a placeholder.</strong> It prints on every passport and shows on patients&apos; phones. Replace it below.</p>
        </div>
      )}

      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault();
          update((d) => ({ ...d, clinic }));
          say("Clinic details saved");
        }}
      >
        <div>
          <h2>Clinic details</h2>
          <p className="muted small">Printed on passports and shown on patients&apos; phone pages.</p>
        </div>
        <label>Therapist<input name="therapist" value={clinic.therapist} onChange={(e) => setClinic({ ...clinic, therapist: e.target.value })} autoComplete="name" /></label>
        <label>Clinic or institution<input name="clinic" value={clinic.clinic} onChange={(e) => setClinic({ ...clinic, clinic: e.target.value })} autoComplete="organization" /></label>
        <label>Contact phone<input name="phone" type="tel" inputMode="tel" value={clinic.phone} onChange={(e) => setClinic({ ...clinic, phone: e.target.value })} autoComplete="tel" />
          <span className="hint">Patients see this number if they need to reach you.</span>
        </label>
        <div className="actions"><button className="btn primary" type="submit">Save clinic details</button></div>
      </form>

      <section className="card">
        <h2>Data</h2>
        <p className="muted small">Data is stored in the clinic database for your account. Exports are on the Evaluation page.</p>
        <div className="row-gap">
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              if (confirm("Replace all data with the demo patients?")) {
                reset();
              }
            }}
          >
            Reset demo data
          </button>
          <span className="muted small">Replaces every patient in this account with the sample patients. It cannot be undone.</span>
        </div>
      </section>
      {toast && <div className="toast" role="status"><Icon name="check" />{toast}</div>}
    </div>
  );
}
