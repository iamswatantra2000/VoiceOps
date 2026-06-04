# F04 — Critical Incident Alerts

## Problem
When an operator reports a CRITICAL or HIGH severity incident, nothing happens
outside the app. No supervisor is notified. The incident just sits in the dashboard
waiting to be spotted. In a real factory, a critical issue — safety risk, fire hazard,
line down — needs immediate human attention, not a passive dashboard.

## Solution
When AI determines severity = `critical` or `high`, automatically send an email
alert to all admin users with:
- Incident summary
- Severity level
- Operator name + department + shift + machine
- The AI's immediate action steps
- A direct link to the incident in the admin panel

## Email Provider
Use **Resend** (resend.com) — free tier (3,000 emails/month), simple REST API,
works perfectly on Vercel serverless. No SMTP config needed.

## Alert Behaviour
| Severity | Alert sent? |
|----------|-------------|
| critical | Yes — immediately on creation |
| high     | Yes — immediately on creation |
| medium   | No |
| low      | No |

## Email Content
- Subject: `🚨 [CRITICAL] Motor fault on M-14 — Assembly Line A`
- Body: clean HTML email with severity badge, operator info, AI steps
- Footer: link to admin incidents page

## API Changes
- `lib/alerts.ts` — new file, `sendCriticalAlert()` function
- `app/api/incidents/route.ts` — call `sendCriticalAlert()` after insert if severity is high/critical

## DB Changes
None.

## Env Vars Needed
- `RESEND_API_KEY` — from resend.com (free account)
- `ALERT_FROM_EMAIL` — verified sender email e.g. `alerts@yourdomain.com`
- `ALERT_TO_EMAILS` — comma-separated list of supervisor emails to notify

## Files Changed
- `lib/alerts.ts` (new)
- `app/api/incidents/route.ts`
- `.env.local` (new vars)

## Status
- [x] Done — 2026-06-04
