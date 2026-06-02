# Changelog

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
