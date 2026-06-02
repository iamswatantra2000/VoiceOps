# F01 — Manual Text Fallback

## Problem
Factory floors are loud. Microphones get blocked by PPE (helmets, masks). Some browsers
(especially on older Android tablets) deny mic permissions. When voice fails, the operator
currently has no way to report — they're stuck.

## Solution
Add a "Type instead" toggle on the operator screen. When tapped, the big mic button is
replaced by a text area + Submit button. The incident flows through the exact same AI
analysis pipeline — the operator just types what they'd have said.

## UI Behaviour
- Idle screen: small link below the mic button — "Can't use mic? Type instead →"
- Tapping it switches the center area to a textarea (large font, easy to tap)
- Submit button triggers the same `POST /api/incidents` as voice
- While typing, character count shown (min 10 chars to submit)
- "Use mic instead ←" link to switch back
- All other states (processing, result) remain identical

## What does NOT change
- API routes — no changes needed
- AI analysis — same pipeline, same result card
- Database schema — transcript is just a string regardless of input method

## Files Changed
- `app/operator/page.tsx` — add input mode toggle + textarea UI

## Status
- [x] Done — 2026-06-02
