# Dentra

Dentra is a desktop dental clinic management app for Algerian private practices. It is built with React 18, TypeScript, Vite, Tauri v2, Rust, SQLite, Zustand, Fluent UI, and Tailwind CSS. The app is designed to work offline, store data locally, and support Arabic, French, and English UI languages.

## What the app covers

- Patient management
- Appointment and calendar management
- Doctor management
- Lab work tracking
- Expense tracking
- Statistics and analytics
- Settings for locale, theme, clinic info, permissions, and printing
- Local backup and restore workflows
- License validation tied to the machine, without any internet dependency

## Project stack

- Frontend: React 18, TypeScript, Vite
- UI: @fluentui/react-components, Tailwind CSS
- State: Zustand
- Localization: i18next, react-i18next
- Dates: date-fns
- Charts: recharts
- PDF export: @react-pdf/renderer
- Backend: Rust with Tauri v2 commands
- Storage: local SQLite through Rust/sqlx

## Repository layout

- `src/` React frontend
- `src/components/` feature components
- `src/hooks/` feature hooks
- `src/pages/` page-level views
- `src/store/` Zustand stores
- `src/services/` Tauri invoke wrappers and integrations
- `src/types/` shared TypeScript models
- `src/i18n/` translation dictionaries
- `src-tauri/src/commands/` Rust command handlers
- `src-tauri/src/db/` database setup
- `src-tauri/migrations/` SQLite migrations
- `docs/` product and architecture documentation

## Getting started

### Prerequisites

- Node.js and npm
- Rust toolchain
- Tauri desktop prerequisites for Windows development if you are building the desktop app on that platform

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

This starts the Vite frontend. Tauri is configured to load the dev server from `http://localhost:5173`.

### Build the app

```bash
npm run build
```

This runs TypeScript checking and creates the production frontend bundle.

### Run the Tauri shell

```bash
npm run tauri
```

Use this for Tauri-related development and desktop packaging workflows.

## Local data and runtime behavior

- The app is offline-first and does not require an internet connection after install.
- Data is stored locally in SQLite through the Rust backend.
- The frontend never accesses the database directly; it talks to Rust through Tauri `invoke()` wrappers in `src/services/`.
- The UI defaults to Arabic and switches layout direction to RTL when Arabic is active.
- Local settings control theme, locale, date format, and license state.

## Tauri configuration

Current Tauri config is in `src-tauri/tauri.conf.json`.

Configured plugins and capabilities include:

- dialog
- shell
- fs access for app data, desktop, and downloads scopes
- process control

## Important product notes

- App data is expected to stay local on the clinic machine.
- Backup and restore should include the SQLite database and any related photos or attachments.
- Prescription and print output default to French.
- Use `fr-DZ` currency formatting for Algerian dinar display.
- Do not add direct database access from React components; keep all persistence in Rust commands and service wrappers.

## Documentation

- `docs/SPEC.md` describes the target product scope.
- `docs/FEATURES.md` describes feature behavior.
- `docs/DB_SCHEMA.md` describes the database model.
- `docs/ARCHITECTURE.md` describes the app structure and data flow.
- `docs/PRINT_TEMPLATES.md` describes print output requirements.

## Notes for contributors

- Keep new UI strings in the i18n dictionaries.
- Keep generated build artifacts out of git.
- Keep repository data local and offline by default.
- Follow the existing feature-folder structure when adding new functionality.