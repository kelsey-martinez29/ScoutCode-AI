# ScoutCode AI

Programming learning companion for Troop 99. React, TypeScript, TanStack Start, and Supabase, originally generated in Lovable.

## Local development

Use Node.js 22.12+ or 24 and npm. Run `npm ci`, copy `.env.example` to `.env`, fill in your own Supabase settings, then run `npm run dev`.

Verification: `npm run typecheck`, `npm test`, `npm run build`, and `npm run deploy:check`.

## Cloudflare Workers

Connect the repository main branch. Build command: `npm run build`. Deploy command: `npm run deploy`. Root directory: repository root. The build emits `.output/server/wrangler.json` and `.wrangler/deploy/config.json`; Wrangler automatically uses the generated configuration.

Build variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
Runtime secrets: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` for the same Supabase project. Never prefix a service-role key with `VITE_`. No credentials are included in the repository.

An independently reachable Supabase backend with the preserved schema and access policies is required for login and saved work. Building does not verify backend connectivity or account permissions. Provision the counselor before exposing a fresh database's first-account setup page publicly.

## Current scope

Six modules, workbook responses, Scout/counselor routes, roster management, and code-draft storage. Code execution, the planned Python/JavaScript/Lua update, AI tutoring, and workbook PDF generation remain incomplete. The restored Code Lab contains the original Scratch placeholder. Repository repair does not make these features complete or verify readiness for real Scout records.
