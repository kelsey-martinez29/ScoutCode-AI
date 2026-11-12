# ScoutCode AI

**Programming Merit Badge learning companion for Scouting America Troop 99**

[Open the deployed app](https://scoutcode-ai.kelseymartinez12.workers.dev)

ScoutCode AI is a web-based learning experience designed to guide Scouts through Programming Merit Badge topics and keep their written workbook responses organized. The project also includes counselor-facing tools.

## Features

- **Six learning modules** organized around the badge coursework.
- **Workbook responses** so Scouts can record answers as they learn.
- **Scout and counselor views** with distinct workflows.
- **Counselor roster management** for organizing participants.
- **Saved code drafts** for programming practice.
- **Supabase-backed authentication and data storage**.

> **Development status:** The deployed app and backend require further validation. The Code Lab still uses a Scratch placeholder; live code execution, AI tutoring, planned language updates, and printable workbook PDF export are not yet implemented. Completing the app does not automatically award a merit badge; Scouts must demonstrate requirements to an approved counselor.

## Homepage screenshot

A verified screenshot of the deployed homepage has not yet been added. Add a real capture as `docs/images/homepage.png` and replace this note with:

`![ScoutCode AI homepage](docs/images/homepage.png)`

## Technology

- React, TypeScript, TanStack Start, Tailwind CSS
- Supabase for authentication and persisted data
- Cloudflare Workers for deployment
- Vite, Vitest, ESLint

## Run locally

Requires Node.js 22.12+.

```bash
npm ci
cp .env.example .env
# Configure your own Supabase environment values
npm run dev
```

Useful checks: `npm run typecheck`, `npm test`, `npm run build`, `npm run deploy:check`.

## Deployment notes

Cloudflare build command: `npm run build`; deploy command: `npm run deploy`.

Build variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.

Server-side secrets: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service-role key through a `VITE_` variable or commit credentials.

The correct Supabase schema, policies, and account setup must be configured before using real Scout information.

## Development approach

Created with AI-assisted development and iterated to support learning, workbook completion, and counselor workflows.
