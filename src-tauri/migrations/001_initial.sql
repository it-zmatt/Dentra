-- Initial schema for Dentra dental clinic app

CREATE TABLE IF NOT EXISTS records (
  id         TEXT    PRIMARY KEY,
  store      TEXT    NOT NULL,
  data       TEXT    NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_store ON records(store);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('currency',            'DZD'),
  ('clinic_name',         ''),
  ('clinic_phone',        ''),
  ('clinic_address',      ''),
  ('doctor_speciality',   'Chirurgien-Dentiste'),
  ('prescription_footer', ''),
  ('start_day_of_wk',     'saturday'),
  ('permissions',         '[false,false,false,false,false,false]');

CREATE TABLE IF NOT EXISTS local_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO local_settings (key, value) VALUES
  ('selected_locale',    'ar'),
  ('date_format',        'dd/MM/yyyy'),
  ('selected_theme',     'light'),
  ('license_key',        ''),
  ('license_machine_id', ''),
  ('license_valid',      'false'),
  ('install_date',       '');

CREATE TABLE IF NOT EXISTS users (
  id            TEXT    PRIMARY KEY,
  email         TEXT    UNIQUE NOT NULL,
  password_hash TEXT    NOT NULL,
  is_admin      INTEGER NOT NULL DEFAULT 0,
  name          TEXT,
  created_at    INTEGER
);
