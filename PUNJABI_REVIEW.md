# Punjabi (Gurmukhi) review list

Nothing in the app was machine-translated during the 2026-11 redesign. All Punjabi text is the
text written for v2. It has **not yet been checked by a native speaker or a physiotherapist**,
and it goes straight to patients, on paper and on their phones. Please have both check it
before real patients use the app.

## What to check

| Where | File | What it is | Who should check |
|---|---|---|---|
| Patient interface words | `lib/i18n.ts`, the `pa` dictionary | Buttons, headings, dates, visit messages, the pain question and its warning, the STOP box, the "how to use your passport" steps, the feedback questions | Native speaker |
| Exercise names, steps, precautions | `lib/exercises.ts`, the `pa` field of each of the 12 exercises | Clinical instructions that patients follow at home | Native speaker **and** physiotherapist |
| Custom exercises | Added by each clinic in the Exercise library | The clinic's own translation | The clinic |

## Safety text: check these first

These tell a patient when to stop. A wrong word here is a safety risk.

- `stopTitle`, `stopBody`: the STOP and contact your therapist box (phone page and printed cover)
- `painHigh`: the warning shown when a patient picks a pain of 7 or more
- `precautions` in every exercise in `lib/exercises.ts`

## Changed in the redesign (Punjabi text itself unchanged)

- `listen`, `watch`, `rememberTick`: the decorative symbol in front was removed (it is now an
  icon beside the text). The words are the same. The tick marks inside sentences such as
  `how2` and `dailyLog` were kept, because they tell the patient to draw a tick.
- English `yourDose` changed from "YOUR AMOUNT" to "Your amount" (capitals only).

## No new Punjabi was written

The login page shows the brand name, and the new patient form shows the name "Sit-to-stand".
Both use the existing translations.
