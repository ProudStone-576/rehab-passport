-- Rehab Passport schema (Neon Postgres). Dates are stored as 'YYYY-MM-DD' text
-- and visit times as local 'YYYY-MM-DDTHH:mm' text, matching the app, so no
-- timezone conversion happens anywhere. Every row carries therapist_id so all
-- reads and writes are scoped to the signed-in therapist.

CREATE TABLE IF NOT EXISTS therapists (
  id            text PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  name          text NOT NULL,
  password_hash text NOT NULL,
  clinic        text NOT NULL DEFAULT '',
  phone         text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patients (
  id           text PRIMARY KEY,
  therapist_id text NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  code         text NOT NULL,
  initials     text NOT NULL DEFAULT '',
  age          integer,
  condition    text NOT NULL DEFAULT '',
  language     text NOT NULL DEFAULT 'en',
  created_at   text NOT NULL,
  phone_token  text NOT NULL UNIQUE  -- secret in the patient's phone link
);

CREATE TABLE IF NOT EXISTS passports (
  id            text PRIMARY KEY,
  therapist_id  text NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id    text NOT NULL,
  version       integer NOT NULL,
  start_date    text NOT NULL,
  end_date      text,
  status        text NOT NULL,
  assessment    text NOT NULL DEFAULT '',
  setup_minutes integer NOT NULL DEFAULT 0,
  next_visit    text,
  items         jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS logs (
  id           text PRIMARY KEY,  -- passportId:itemId:date, so phone and clinic ticks never duplicate
  therapist_id text NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  passport_id  text NOT NULL,
  item_id      text NOT NULL,
  date         text NOT NULL,
  source       text NOT NULL
);

CREATE TABLE IF NOT EXISTS pain (
  id           text PRIMARY KEY,  -- passportId:date
  therapist_id text NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  passport_id  text NOT NULL,
  date         text NOT NULL,
  score        integer NOT NULL CHECK (score BETWEEN 0 AND 10),
  source       text NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id           text PRIMARY KEY,
  therapist_id text NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id   text NOT NULL,
  passport_id  text NOT NULL,
  date         text NOT NULL,
  minutes      integer NOT NULL DEFAULT 0,
  outcome      text NOT NULL,
  notes        text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS feedback (
  id           text PRIMARY KEY,
  therapist_id text NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id   text NOT NULL,
  passport_id  text NOT NULL,
  date         text NOT NULL,
  ease         integer NOT NULL,
  understood   text NOT NULL,
  comments     text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS exercises (
  id           text PRIMARY KEY,
  therapist_id text NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  data         jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS photos (
  therapist_id text NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  exercise_id  text NOT NULL,
  urls         jsonb NOT NULL,
  PRIMARY KEY (therapist_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS patients_therapist ON patients (therapist_id);
CREATE INDEX IF NOT EXISTS passports_therapist ON passports (therapist_id);
CREATE INDEX IF NOT EXISTS logs_passport ON logs (passport_id);
CREATE INDEX IF NOT EXISTS logs_therapist ON logs (therapist_id);
CREATE INDEX IF NOT EXISTS pain_passport ON pain (passport_id);
CREATE INDEX IF NOT EXISTS reviews_therapist ON reviews (therapist_id);
CREATE INDEX IF NOT EXISTS feedback_therapist ON feedback (therapist_id);
