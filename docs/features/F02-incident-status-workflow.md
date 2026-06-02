# F02 — Incident Status Workflow

## Problem
Every incident is stuck at "open" forever. There is no way for a supervisor to
acknowledge it, start working on it, or mark it resolved. The admin incidents
page shows status as a static badge with no way to change it.

## Solution
Add a 3-step status lifecycle managed by admins:

  OPEN → IN PROGRESS → RESOLVED

- Admin can advance the status from the incident detail panel
- Each status change can include an optional resolution note
- The status + note are stored in the database
- Operator history drawer shows the updated status of their own incidents

## Status Steps

| Status      | Meaning                                         | Color  |
|-------------|-------------------------------------------------|--------|
| open        | Just reported, nobody has picked it up yet      | Amber  |
| in_progress | Supervisor acknowledged, being worked on        | Blue   |
| resolved    | Issue fixed, note added by supervisor           | Green  |

## UI Changes

### Admin — Incidents detail panel (`/admin/incidents`)
- Status badge becomes a 3-step progress stepper
- "Mark In Progress" button when status = open
- "Mark Resolved" button + optional resolution note textarea when in_progress
- Once resolved: show resolution note and who resolved it + timestamp

### Operator — History drawer (`/operator`)
- Each history item now shows status pill (open / in progress / resolved)
- If resolved: green tick + resolution note visible on tap

## API Changes
- `PATCH /api/incidents` — update status + optional resolution_note

## DB Changes
- Add columns to `incidents`: `resolution_note TEXT`, `resolved_by INTEGER`, `resolved_at DATETIME`

## Files Changed
- `lib/db.ts` — migration to add new columns
- `app/api/incidents/route.ts` — add PATCH handler
- `app/admin/incidents/page.tsx` — status stepper + resolve button in detail panel
- `app/operator/page.tsx` — show status in history drawer

## Status
- [x] Done — 2026-06-02
