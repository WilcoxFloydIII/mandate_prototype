# Mandate — Investor Prototype

A high-fidelity, click-through web prototype of Mandate (institutional time & presence
auditing engine) for investor demos. Built per `Mandate_Investor_Prototype_Plan.md` —
this is a front-end simulation only; no real auth, camera, biometrics, or backend.

**Stack:** React 19 + TypeScript, Vite, Tailwind CSS v4, Framer Motion, Recharts, Zustand,
React Router. (The plan's own stack note suggested Next.js; this build uses Vite instead
since it's a pure client-side SPA with no server needs — it deploys to Vercel identically.)

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # type-checks with tsc -b, then builds with vite
npm run preview # serve the production build locally
```

Deploys to Vercel with zero config (framework preset: Vite).

## What's in this pass

- `src/data/mockData.ts` — the full seeded dataset (institution, faculties, departments,
  users across all 6 roles, courses, enrollments, class instances, attendance records,
  threshold summaries, corrections, activity log) plus typed accessor functions. Dates are
  computed relative to real "now" at load time, so there's always a live, in-window class
  on the two flagship courses (CSC201, CSC301) regardless of what day this is opened.
- Root layout shell: `DemoBanner` (persistent disclaimer), `TopNav` (persona switcher),
  `PhoneFrame` / `DesktopShell` (the two visual registers), `AppShell` (ties it together,
  URL-driven so deep links resolve to the right persona on load).
- Landing role selector + a real (not stubbed) home screen for all six personas, pulling
  live numbers from the mock dataset. Every other sitemap page from the plan is routed and
  renders a placeholder — routing won't 404 as later screens get built out.

## Structure

```
src/
  types/           domain types (mirrors the PRD schema, simplified)
  data/mockData.ts seed dataset + accessors
  config/          persona metadata, per-role sidebar nav
  store/           Zustand session store (current persona)
  components/
    layout/        DemoBanner, TopNav, PhoneFrame, DesktopShell, AppShell, SectionPlaceholder
    shared/         StatusPill, KPICard, ComparisonChart
  pages/           one folder per role
```

## Demo defaults

The persona switcher always resolves to one canonical person per role for a consistent
pitch narrative:

- **Student** — Amara Chukwu (300L, Computer Science)
- **Lecturer** — Mr. Obinna Nwachukwu (Computer Science — teaches the same CSC201/CSC301
  Amara is enrolled in, so switching Student → Lecturer mid-pitch shows the same class)
- **HOD** — Dr. Ngozi Eze (Computer Science)
- **Dean** — Prof. Chinyere Uzo (Faculty of Natural & Applied Sciences)
- **Vice-Chancellor** — Prof. Emmanuel Nnaji
- **System Administrator** — Mrs. Chidinma Okoye
