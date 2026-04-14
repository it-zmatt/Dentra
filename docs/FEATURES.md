# Feature Descriptions

## Feature: Patients
Full patient records with dental chart, payment tracking, WhatsApp reminder.
See SPEC.md section 2 for complete field list.
Payment status computed from done appointments only.
Photos pulled from linked appointments.

## Feature: Appointments / Calendar
Week-view calendar. Receptionist books by phone, enters manually.
Payment method: Cash, CCP, or BaridiMob.
WhatsApp reminder button pre-fills French message.
Photos stored as relative paths in AppData photos directory.

## Feature: Doctors
Profiles, duty days, user locking.
Duty days constrain available dates when scheduling appointments.

## Feature: Lab Work
Lab work order tracking with payment status.
Auto-complete for lab name based on history.

## Feature: Expenses
Expense tracking with tags and payment status.
Auto-complete for issuer name based on history.

## Feature: Statistics
Revenue, appointments, new patients, expenses.
Filter by doctor and date range.
Interval toggle: Days / Weeks / Months / Quarters / Years.

## Feature: Settings
Global (admin): currency, clinic name, clinic phone, prescription footer, week start day.
Local (device): language, theme, date format.
Backup export/import via zip to USB.
License info display.

## Feature: License
7-day grace period on first install.
HMAC key tied to machine ID.
Hardware change rekey screen with clear instructions.

## Feature: Backup
Zip export of data.db + photos/ directory.
Restore replaces database and merges photos.
App restarts after restore.

## Feature: WhatsApp Reminder
One button on appointment card.
Opens WhatsApp with pre-filled French message.
No API. Receptionist sends manually.

## Feature: Prescription PDF
Always printed in French regardless of UI language.
Fields: clinic header, doctor name + speciality,
patient name + age, date, free-text prescription lines.
Opens native Windows print dialog.
