# Admin Dashboard — Vaults + Farmers Module

Status: approved, ready for implementation planning
Date: 2026-07-23

## Context

`admin-dashboard` is a new, empty repo. It needs to give Panora ops staff a
way to manage the data both `field-app-v2` (Expo, field agents) and
`PanoraAppMobile` (Vite, investors) read/write through `core-services`
(Fastify + Postgres/Neon, `pg` pool, no ORM).

The admin surface spans many domains (vaults, farmers, investors/users,
market listings, notifications, analytics). This spec covers **one
sub-project only: Vaults + Farmers (field ops)**. Other domains get their
own spec later.

Current state discovered during brainstorming (README in core-services is
stale on two points — corrected here):

- `vaults` and `farmers` tables and their `/app/*` and `/field/*` routes are
  **already live**, not stubs.
- Both `/app/*` and `/field/*` routes authenticate via **Privy JWT**
  (`privyAuth` / `fieldPrivyAuth` in `src/plugins/auth.ts`), not an API key.
- `poa_events` / `harvest_events` are **append-only, auto-applied**: when a
  field agent submits a PoA or harvest capture, the vault row is mutated
  immediately (`applyPoa` / `applyHarvest` in `lib/vaults.ts`) and a
  notification is fired. There is currently no pending/approval state.

## Scope

In scope:
- New `admin-dashboard` Next.js app (App Router + shadcn/ui) with
  email/password admin login, and CRUD UI for vaults + farmers, and an
  approve/reject review UI for PoA/harvest events.
- New `/admin/*` route group in `core-services` backing that UI.
- New `admin_users` table, review columns on `poa_events`/`harvest_events`,
  `archived` status value on `vaults`/`farmers`.

Out of scope (explicitly deferred):
- Investors/users, portfolio, wallets, market listings, notifications admin.
- Changing the field-app submit flow to gate on approval — approve/reject
  in this spec is **audit-only** (see Decisions below); the vault is not
  reverted on rejection.
- Any RBAC / multi-role admin permissions — one flat `admin_users` role.

## Decisions made during brainstorming

1. **First module**: Vaults + Farmers (field ops), chosen because it
   unblocks/manages data both apps depend on and touches the fewest stub
   routes.
2. **Stack**: Next.js (App Router) + shadcn/ui for admin-dashboard.
3. **Admin auth**: new, self-contained email/password admin login (not
   reusing Privy, not a shared-secret gate) — gives per-admin identity and
   an audit trail (`reviewed_by`) for event review.
4. **Event review model**: audit-only. Approving/rejecting a `poa_events` /
   `harvest_events` row stamps `status`/`reviewed_by`/`reviewed_at` for
   record-keeping. It does **not** revert the vault mutation that already
   happened on submit. Reworking the field submit flow into a
   pending-until-approved gate is a larger, separate change (touches
   `field-app-v2` UX) and is deferred.
5. **Delete semantics**: soft delete only. "Deleting" a vault or farmer sets
   `status = 'archived'`. No hard delete — `vaults` has `on delete cascade`
   to `poa_events`/`harvest_events` and `on delete set null` from `farmers`,
   so hard delete would silently destroy history; archived status avoids
   that entirely.

## Architecture

```
admin-dashboard (Next.js App Router, shadcn/ui)
  Server Components / Route Handlers call core-services with Bearer JWT
        │
        ▼
core-services (existing Fastify API)
  + src/routes/admin/*      auth, vaults, farmers, poa-events, harvest-events
  + src/plugins/auth.ts     + adminAuth preHandler (mirrors privyAuth/fieldPrivyAuth)
  + src/lib/admin-auth.ts   scrypt hash/verify (node:crypto) + jose sign/verify
        │
        ▼
Postgres / Neon (existing)
  + 0009_admin_users.sql
  + 0010_admin_review.sql
```

**Auth flow**: Next.js login page → server action POSTs credentials to
`core-services` `/admin/auth/login` → core-services verifies against
`admin_users` (scrypt) → signs a JWT with `jose` (HS256, shared
`ADMIN_JWT_SECRET` env var present in both repos) → Next.js stores the JWT
in its own httpOnly cookie → every subsequent server-side fetch to
core-services attaches `Authorization: Bearer <token>`.

Stateless (no session table), no new dependencies: `jose` is already a
core-services dependency; password hashing uses `node:crypto`'s
`scrypt`/`scryptSync` (stdlib) instead of adding `bcrypt`.

First admin is created via a one-off script, `pnpm seed:admin <email>
<password>` in core-services (hashes with scrypt, upserts into
`admin_users`) — no signup flow.

## Data model changes

```sql
-- 0009_admin_users.sql
create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,   -- scrypt: "salt:hash" hex
  name          text not null,
  created_at    timestamptz not null default now()
);

-- 0010_admin_review.sql
alter table public.vaults drop constraint vaults_status_check;
alter table public.vaults add constraint vaults_status_check
  check (status in ('active','poa_due','pending','completed','archived'));

alter table public.farmers drop constraint farmers_status_check;
alter table public.farmers add constraint farmers_status_check
  check (status in ('verified','pending','new','archived'));

alter table public.poa_events
  add column if not exists status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  add column if not exists reviewed_by uuid references public.admin_users(id),
  add column if not exists reviewed_at timestamptz;

alter table public.harvest_events
  add column if not exists status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  add column if not exists reviewed_by uuid references public.admin_users(id),
  add column if not exists reviewed_at timestamptz;
```

All additive; no breaking changes to existing `/app/*` or `/field/*` routes
or payload shapes (`toFieldVault`, `toExploreVault`, etc. are unaffected —
new columns aren't included in those projections).

## API surface — `core-services` `/admin/*`

All routes except login are gated by the new `adminAuth` preHandler
(verifies the JWT, mirrors `privyAuth`'s shape — sets `req.adminId`).

| Method | Path | Body / Query | Notes |
|---|---|---|---|
| POST | `/admin/auth/login` | `{email, password}` | → `{token, admin: {id, email, name}}` |
| GET | `/admin/vaults` | `?status=`, `?q=` (code/location) | list |
| GET | `/admin/vaults/:id` | — | detail |
| POST | `/admin/vaults` | vault fields | create |
| PATCH | `/admin/vaults/:id` | partial vault fields | edit; `status: 'archived'` = soft delete |
| GET | `/admin/farmers` | `?status=`, `?vaultId=`, `?q=` | list |
| GET | `/admin/farmers/:id` | — | detail |
| POST | `/admin/farmers` | farmer fields | create |
| PATCH | `/admin/farmers/:id` | partial farmer fields | edit; `status: 'archived'` = soft delete |
| GET | `/admin/vaults/:id/poa-events` | — | list, newest first |
| GET | `/admin/vaults/:id/harvest-events` | — | list, newest first |
| PATCH | `/admin/poa-events/:id` | `{status: 'approved'\|'rejected'}` | stamps `reviewed_by`/`reviewed_at` |
| PATCH | `/admin/harvest-events/:id` | `{status: 'approved'\|'rejected'}` | stamps `reviewed_by`/`reviewed_at` |

Implementation reuses existing patterns already in the codebase: `query`/
`one` from `db/pool.ts`, `formatZodError` for validation errors, per-route
zod body schemas (see `field/vaults.ts` for the shape to follow).

## Admin dashboard pages (Next.js)

- `/login` — email/password form, sets httpOnly cookie on success.
- `/vaults` — shadcn `DataTable`: code, crop, location, status, day
  progress, farmer count. Filter by status, text search.
- `/vaults/[id]` — edit form (react-hook-form + zod) + tabs: "PoA Events"
  and "Harvest Events", each row has Approve/Reject buttons (disabled once
  reviewed, showing reviewer + timestamp).
- `/vaults/new` — create form.
- `/farmers` — `DataTable`: code, name, vault, status. Filter/search.
- `/farmers/[id]` — edit form.
- `/farmers/new` — create form.

Shared building blocks: shadcn `DataTable`, `react-hook-form` + `zod`
(zod already used server-side; add both as admin-dashboard deps), a status
`Badge` component with per-status color mapping.

## Error handling

- Server-side fetches to core-services: non-2xx responses surface as toast
  notifications in the UI (shadcn `sonner`/`toast`); 401 redirects to
  `/login` and clears the cookie.
- Form validation: zod schemas shared in shape (not code, different
  runtimes) with core-services' route validators; mismatches surface as
  inline field errors via react-hook-form.
- Approve/reject is idempotent-guarded: PATCH rejects with 409 if the event
  is not currently `pending`.

## Testing

- `core-services`: extend `test/smoke.ts` with an admin happy path — seed
  admin, login, create vault, create farmer, submit PoA (reuse existing
  field flow), approve it, verify `reviewed_by`/`status` persisted.
- `admin-dashboard`: no e2e harness in this spec; manual verification via
  dev server (`pnpm dev`) covering login → vault CRUD → farmer CRUD →
  event approve/reject, per this project's "test the golden path in a
  browser" convention.
