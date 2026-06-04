# Changelog

## 2026-06-04 — F04: Critical Incident Alerts

### Added
- `lib/alerts.ts` — `sendIncidentAlert()` using Resend email API
- Beautiful HTML email with severity badge, operator meta, transcript,
  safety warnings, numbered action steps, and a direct admin link
- Alerts fire automatically on `high` and `critical` incidents
- Non-blocking — alert send runs in background, won't slow down API response
- Gracefully skips if `RESEND_API_KEY` or `ALERT_TO_EMAILS` not set
- New env vars: `RESEND_API_KEY`, `ALERT_FROM_EMAIL`, `ALERT_TO_EMAILS`

### Files changed
- `lib/alerts.ts` (new)
- `app/api/incidents/route.ts`
- `docs/features/F04-critical-alerts.md`

---

## 2026-06-02 — F03: Shift & Machine Tag

### Added
- `shift` and `machine` columns in `incidents` table via safe boot migration
- Operator screen: shift picker (Morning 🌅 / Afternoon ☀️ / Night 🌙) auto-selects based on current time
- Operator screen: optional Machine/Station text input above voice/type toggle
- Both fields passed to AI for richer context in analysis
- Processing state and result card show selected shift + machine as pills
- Admin incidents list: shift + machine shown inline on each card
- Admin incidents detail panel: shift + machine in meta section
- Admin filter row: filter incidents by shift (All / Morning / Afternoon / Night)

### Files changed
- `lib/db.ts`, `lib/ai.ts`, `app/api/incidents/route.ts`
- `app/operator/page.tsx`, `app/admin/incidents/page.tsx`
- `docs/features/F03-shift-machine-tag.md`

---

## 2026-06-02 — F02: Incident Status Workflow

### Added
- `PATCH /api/incidents` — advance status (open → in_progress → resolved), forward-only
- `resolution_note`, `resolved_by`, `resolved_at` columns added to `incidents` via safe boot migration
- Admin incidents page: 3-step visual stepper (Open → In Progress → Resolved) in detail panel
- "Mark In Progress" button when status = open
- Resolution note textarea + "Mark Resolved" button when status = in_progress
- Resolved panel shows note, resolver name, and timestamp
- Status + severity dual filter pills on the incidents list
- Operator history drawer: status pill per incident + resolution note shown inline

### Files changed
- `lib/db.ts`, `app/api/incidents/route.ts`
- `app/admin/incidents/page.tsx`, `app/operator/page.tsx`
- `docs/features/F02-incident-status-workflow.md`

---

## 2026-06-02 — F01: Manual Text Fallback

### Added
- Voice / Type toggle pills on the operator idle screen
- Text mode: large textarea, character count hint (min 10 chars), Submit button
- Both modes feed into the exact same `submitIncident()` → AI analysis pipeline
- `switchMode()` resets error and typed text on toggle
- `reset()` now also clears `typedText` state

### Files changed
- `app/operator/page.tsx`
- `docs/features/F01-manual-text-fallback.md`

---


## 2026-06-02 — Initial Build

### Added
- Project initialized: Next.js 14 with Tailwind CSS, TypeScript
- SQLite database with schema: `users`, `incidents`, `documents`, `incident_feedback`
- Seed data: ADMIN001 (admin) + OP001/OP002 (operators)
- JWT-based authentication (HTTP-only cookies, 8h expiry)
- `/api/auth/login` — POST login
- `/api/auth/logout` — POST logout
- `/api/auth/me` — GET current user
- `/api/incidents` — GET list, POST create with AI analysis
- `/api/documents` — GET/POST/DELETE knowledge base documents
- Anthropic Claude integration (`lib/ai.ts`) with document context injection
- Operator App (`/operator`):
  - Voice recording via Web Speech API
  - Live transcript while speaking
  - Processing state with spinner
  - Result card showing: severity badge, safety warnings, immediate actions, possible causes, escalation contact
  - Recent incident history drawer
- Admin App (`/admin`):
  - Stats dashboard (total, open, critical incidents + document count)
  - Knowledge Base page (`/admin/documents`) — drag-and-drop PDF/TXT upload
  - Incidents page (`/admin/incidents`) — filterable list with detail panel
- Login page with Scania branding
- Project documentation in `/docs/PROJECT.md`

### Design Decisions
- Single large "TAP TO SPEAK" button for operator UX — zero cognitive load
- Scania brand colors: #003057 (navy) + #E07B39 (orange)
- AI severity scale: low/medium/high/critical with color coding
- Knowledge base stored as plain extracted text in SQLite (no vector DB needed for MVP)
