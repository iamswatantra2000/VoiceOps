# F03 — Shift & Machine Tag

## Problem
Incidents currently carry no context about *when* (which shift) or *what* (which
machine/station) was involved. This makes it impossible to spot patterns like:
"Machine M-14 has been reported 4 times on the night shift this week."

## Solution
Before an operator submits an incident (voice or text), they pick two quick fields:
- **Shift** — Morning / Afternoon / Night (pre-selected based on current time)
- **Machine / Station** — a short free-text field (e.g. "M-14", "Welding Bay 3")

These are optional but encouraged. They are passed to the AI for better analysis
and stored on the incident record for admin filtering.

## Auto-select Shift Logic
| Time window   | Shift       |
|---------------|-------------|
| 06:00 – 13:59 | Morning     |
| 14:00 – 21:59 | Afternoon   |
| 22:00 – 05:59 | Night       |

## UI Changes

### Operator screen (`/operator`) — idle state
- Two compact fields appear *above* the voice/type toggle:
  - Shift selector: 3 pill buttons (Morning / Afternoon / Night), auto-selected on load
  - Machine/Station: short text input with placeholder "e.g. M-14, Conveyor Belt 3"
- Fields are always visible regardless of Voice or Type mode
- Both values are passed to `submitIncident()`

### Admin — Incidents list + detail panel
- Machine and shift shown in the incident meta section
- New filter pill row: filter by shift (All / Morning / Afternoon / Night)

## API Changes
- `POST /api/incidents` — accept `shift` and `machine` in request body
- `GET /api/incidents` — return `shift` and `machine` fields
- AI prompt updated to include shift and machine context

## DB Changes
- Add `shift TEXT` and `machine TEXT` columns to `incidents` table (safe migration)

## Files Changed
- `lib/db.ts` — migration
- `lib/ai.ts` — include shift + machine in AI prompt
- `app/api/incidents/route.ts` — accept + store shift/machine
- `app/operator/page.tsx` — shift pills + machine input UI
- `app/admin/incidents/page.tsx` — show shift/machine in detail + filter

## Status
- [x] Done — 2026-06-02
