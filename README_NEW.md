Sales Coaching Prototype
======================================

Quick summary
-------------

High-fidelity frontend prototype that helps sales reps review recorded calls and translate insights into measurable behavioral change. The UX treats each call as "game tape": an interactive timeline (waveform) with timestamped coaching, objections, and suggested rewrites.

Why this exists
--------------

- Focus: fast, day-to-day coaching for SDRs and frontline reps.
- Core assumption: actionable coaching must point to concrete moments in a call.
- Outcome: reduce monologues, surface objections, and improve talk/listen balance through repeatable workflows.

Key features
------------

- Game Tape visualization: waveform with speaker turns and semantic markers (objections, buying signals, topic shifts).
- Contextual coaching: timestamped suggestions, "Rewind & Rewrite" phrasing, and top moments to review.
- Behavioral tracking: cross-call metrics and goal visualization (e.g., monologue duration trends).
- Calls list & triage: statuses (Completed / Processing / Error), call types, and quick filters.
- Safe deletion: trash workflow with restore capability.

Implementation notes
--------------------

- Built with Next.js. UI and interaction patterns are implemented
- Supabase is used for auth in the prototype; AI transcription is mocked.

Quick start
-----------

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment (example):

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

3. Run locally:

```bash
pnpm dev
```