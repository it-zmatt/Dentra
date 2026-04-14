# Architecture

## Data flow — every operation follows this path

```
User action
  → React component calls store action
  → Zustand store calls service function (src/services/db.ts)
  → Service calls invoke('rust_command', { args })
  → Rust command receives args
  → sqlx query runs against SQLite
  → Result returned to Rust command
  → Serialized and returned to frontend
  → Store updates state
  → Component re-renders
```

## Feature module structure
Each feature has exactly these pieces:
- `src/pages/{Feature}Page.tsx` — page layout
- `src/components/{feature}/` — sub-components
- `src/hooks/use{Feature}.ts` — data access and business logic
- `src/store/{feature}Store.ts` — Zustand state
- `src/services/db.ts` — invoke() calls (all features in one file)
- `src-tauri/src/commands/{feature}.rs` — Rust handlers
- `src-tauri/migrations/` — SQL if new tables needed

## Permissions system
6 boolean flags stored as JSON array in settings table under key 'permissions'
- Index 0 = Doctors
- Index 1 = Patients
- Index 2 = Appointments
- Index 3 = Labworks
- Index 4 = Expenses
- Index 5 = Statistics

Admin always sees everything regardless of flags.
If flag is false, route is hidden from nav entirely.

## RTL / LTR
- Root `<div>` gets `dir="rtl"` when locale is 'ar'
- Root `<div>` gets `dir="ltr"` for 'fr' and 'en'
- FluentUI components respect `dir` attribute automatically
- Print templates always use `dir="ltr"` and French strings

## App startup sequence
1. Read local_settings from SQLite
2. Check license validity (LicenseService)
3. If grace period expired and no valid key → show license screen
4. Check for saved credentials → auto-login or show login screen
5. Load all stores from SQLite
6. Render main layout based on user role and permissions
