# VoiceOps — AI-Powered Incident Handler for Scania Production Lines

## Problem Statement

Factory operators on Scania's production lines encounter machine faults, process deviations, and safety incidents daily. Current reporting is slow: manual forms, phone calls up the chain, and unclear escalation paths. Operators are hands-on workers — not tech-savvy — and need tools that get out of their way fast.

## Solution

VoiceOps is a two-part web application:

### 1. Operator App (`/operator`)
- Operator logs in with Employee ID + Password
- Lands on a single screen with one large button: **TAP TO SPEAK**
- Speaks the incident in plain language using their browser microphone
- AI analyzes the report against the plant's knowledge base (uploaded manuals, SOPs)
- Instantly displays:
  - Severity level (LOW / MEDIUM / HIGH / CRITICAL)
  - Summary of what happened
  - Immediate step-by-step actions to take
  - Possible root causes
  - Who to escalate to
  - Safety warnings if applicable

### 2. Admin/Training App (`/admin`)
- Supervisors upload PDFs, manuals, troubleshooting guides, SOPs
- AI uses these as its knowledge base for analyzing incidents
- View all incidents across departments, filter by severity
- Dashboard with key stats (open incidents, critical count, etc.)

## Design Philosophy

- **One tap, one action**: Operator screen has zero cognitive load — one big button
- **Voice-first**: No typing required. Operators speak naturally
- **Mobile-friendly**: Designed for tablets and phones used on the factory floor
- **Scania colors**: #003057 (dark blue) and #E07B39 (orange)
- **Plain language**: AI responses avoid jargon — steps are numbered, clear, and direct

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Next.js API Routes |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Voice | Web Speech API (browser-native) |
| Database | SQLite via better-sqlite3 |
| Auth | JWT stored in HTTP-only cookies |
| PDF Parsing | pdf-parse |

## Project Structure

```
/app
  /api
    /auth/login       POST - Login with employee_id + password
    /auth/logout      POST - Clear session
    /auth/me          GET  - Get current user
    /incidents        GET/POST - List or create incidents
    /documents        GET/POST/DELETE - Manage knowledge base documents
  /operator           Operator dashboard (voice reporting)
  /admin              Admin dashboard
    /documents        Upload and manage knowledge base PDFs
    /incidents        View all incidents with detail panel
/lib
  db.ts               SQLite database setup and schema
  auth.ts             JWT helpers
  ai.ts               Anthropic Claude integration
/docs
  PROJECT.md          This file — project overview
  CHANGELOG.md        Daily change log
```

## Demo Credentials

| Role | Employee ID | Password |
|------|-------------|----------|
| Admin | ADMIN001 | admin123 |
| Operator | OP001 | operator123 |
| Operator | OP002 | operator123 |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set your Anthropic API key
echo "ANTHROPIC_API_KEY=your_key_here" >> .env.local

# 3. Run the dev server
npm run dev
```

Visit http://localhost:3000
