# Vaults + Farmers Admin Module — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin dashboard (Next.js) backed by new `/admin/*` routes in `core-services`, giving Panora ops staff CRUD over `vaults` and `farmers`, and audit-only approve/reject review over `poa_events`/`harvest_events`.

**Architecture:** `core-services` (Fastify, `pg` pool, no ORM) gets a new `/admin/*` route group gated by a stateless JWT (`jose`, HS256, shared `ADMIN_JWT_SECRET`) issued from a new `admin_users` table (password hashed with `node:crypto` scrypt — no new deps). `admin-dashboard` is a new Next.js App Router app; Server Components/Actions call `core-services` with the JWT stored in an httpOnly cookie.

**Tech Stack:** core-services: Fastify 5, `pg`, `zod`, `jose` (all existing deps) + `node:crypto` (stdlib). admin-dashboard: Next.js 15 (App Router, TypeScript), shadcn/ui, `react-hook-form` + `@hookform/resolvers/zod` + `zod`.

## Global Constraints

- No ORM — raw SQL via `query`/`one` from `src/db/pool.ts`, same as every existing route.
- Route handlers validate bodies with `zod` + `formatZodError` (`src/lib/validation.ts`), matching `field/farmers.ts` / `field/vaults.ts` conventions.
- Row → domain mapping happens in `src/lib/*.ts` (mirrors `lib/vaults.ts`, `lib/farmers.ts`), never inline in routes.
- Migrations are idempotent (`create table if not exists`, `add column if not exists`) and numbered sequentially after the last existing file (`0009_field_writepath.sql` → next is `0010_...`).
- No hard deletes. "Delete" = `PATCH .../status = 'archived'`.
- Event review is audit-only: approving/rejecting `poa_events`/`harvest_events` never mutates the `vaults` row.
- admin-dashboard: no `@tanstack/react-table` or other new table library — shadcn `Table` primitives are sufficient for this data size.
- DB-touching behavior (inserts/updates against real Postgres) is validated manually against a real Neon/local Postgres instance per this codebase's existing convention (`test/smoke.ts` only exercises the auth gate via `fastify.inject`, no live DB in CI) — each backend task's test step says exactly what to run manually.

---

## File Structure

```
core-services/
  db/migrations/
    0010_admin_users.sql
    0011_admin_review.sql
  src/
    env.ts                          (modify: + ADMIN_JWT_SECRET)
    app.ts                          (modify: register adminRoutes)
    plugins/auth.ts                 (modify: + adminAuth preHandler)
    lib/
      admin-auth.ts                 (new: scrypt hash/verify, jose sign/verify)
      admin.ts                      (new: row→domain mappers for admin_users/vaults/farmers/events)
    types/domain.ts                 (modify: + 'archived' status, AdminVault/AdminFarmer/AdminPoaEvent/AdminHarvestEvent types)
    routes/admin/
      index.ts                      (new: registers admin route group)
      auth.ts                       (new: POST /admin/auth/login)
      vaults.ts                     (new: GET/POST/PATCH vaults)
      farmers.ts                    (new: GET/POST/PATCH farmers)
      events.ts                     (new: GET/PATCH poa+harvest events)
  scripts/
    seed-admin.ts                   (new: pnpm seed:admin <email> <password>)
  package.json                      (modify: + seed:admin script)
  .env.example                      (modify: + ADMIN_JWT_SECRET)
  test/smoke.ts                     (modify: + admin route auth-gate assertions)

admin-dashboard/
  package.json, tsconfig.json, next.config.ts, tailwind config  (new, via create-next-app + shadcn init)
  .env.local.example                (new: CORE_SERVICES_URL)
  middleware.ts                     (new: redirect unauthenticated → /login)
  src/
    lib/
      session.ts                   (new: cookie get/set/clear)
      api.ts                       (new: adminFetch wrapper + ApiError)
      types.ts                     (new: AdminVault/AdminFarmer/AdminPoaEvent/AdminHarvestEvent — mirrors core-services)
    app/
      login/page.tsx, actions.ts   (new: login form + server action)
      vaults/page.tsx              (new: list + filters)
      vaults/new/page.tsx          (new: create form)
      vaults/[id]/page.tsx         (new: edit form + PoA/Harvest tabs)
      vaults/actions.ts            (new: createVault/updateVault/reviewPoaEvent/reviewHarvestEvent server actions)
      farmers/page.tsx             (new: list + filters)
      farmers/new/page.tsx         (new: create form)
      farmers/[id]/page.tsx        (new: edit form)
      farmers/actions.ts           (new: createFarmer/updateFarmer server actions)
    components/
      status-badge.tsx             (new: shared status → color mapping)
```

---

### Task 1: Migrations — `admin_users` table + review columns + archived status

**Files:**
- Create: `core-services/db/migrations/0010_admin_users.sql`
- Create: `core-services/db/migrations/0011_admin_review.sql`

**Interfaces:**
- Produces: `admin_users(id, email, password_hash, name, created_at)`; `vaults.status` accepts `'archived'`; `farmers.status` accepts `'archived'`; `poa_events`/`harvest_events` gain `status` (default `'pending'`), `reviewed_by`, `reviewed_at`.

- [ ] **Step 1: Write `0010_admin_users.sql`**

```sql
-- Admin users for the admin-dashboard. Flat role, no RBAC — one admin type.
create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,   -- node:crypto scrypt, "salt:hash" hex
  name          text not null,
  created_at    timestamptz not null default now()
);
```

- [ ] **Step 2: Write `0011_admin_review.sql`**

```sql
-- Admin review + soft-delete support. Additive: existing /app and /field
-- routes/payload shapes are unaffected (new columns aren't in their
-- projections).

alter table public.vaults drop constraint if exists vaults_status_check;
alter table public.vaults add constraint vaults_status_check
  check (status in ('active','poa_due','pending','completed','archived'));

alter table public.farmers drop constraint if exists farmers_status_check;
alter table public.farmers add constraint farmers_status_check
  check (status in ('verified','pending','new','archived'));

alter table public.poa_events
  add column if not exists status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  add column if not exists reviewed_by uuid references public.admin_users (id),
  add column if not exists reviewed_at timestamptz;

alter table public.harvest_events
  add column if not exists status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  add column if not exists reviewed_by uuid references public.admin_users (id),
  add column if not exists reviewed_at timestamptz;
```

- [ ] **Step 3: Apply against local/dev Postgres and verify**

Run (against a real `DATABASE_URL`, e.g. local Postgres or a Neon dev branch):

```bash
psql "$DATABASE_URL" -f db/migrations/0010_admin_users.sql
psql "$DATABASE_URL" -f db/migrations/0011_admin_review.sql
psql "$DATABASE_URL" -f db/migrations/0010_admin_users.sql   # idempotency check
psql "$DATABASE_URL" -f db/migrations/0011_admin_review.sql  # idempotency check
psql "$DATABASE_URL" -c "\d admin_users"
psql "$DATABASE_URL" -c "select column_name from information_schema.columns where table_name = 'poa_events' order by column_name;"
```

Expected: both files apply twice without error; `admin_users` has the 4 columns; `poa_events` columns include `status`, `reviewed_by`, `reviewed_at`.

- [ ] **Step 4: Commit**

```bash
cd core-services
git add db/migrations/0010_admin_users.sql db/migrations/0011_admin_review.sql
git commit -m "db: add admin_users table, event review columns, archived status"
```

---

### Task 2: `lib/admin-auth.ts` — password hashing + JWT

**Files:**
- Create: `core-services/src/lib/admin-auth.ts`
- Modify: `core-services/test/smoke.ts`
- Modify: `core-services/src/env.ts`
- Modify: `core-services/.env.example`

**Interfaces:**
- Produces: `hashPassword(password: string): string`, `verifyPassword(password: string, stored: string): boolean`, `signAdminToken(adminId: string, secret: string): Promise<string>`, `verifyAdminToken(token: string, secret: string): Promise<string>` (returns adminId, throws on invalid).
- Consumes: `env.ADMIN_JWT_SECRET` (added this task).

- [ ] **Step 1: Add `ADMIN_JWT_SECRET` to env schema**

Edit `core-services/src/env.ts`, add to the `schema` object (after `PRIVY_APP_ID`):

```ts
  ADMIN_JWT_SECRET: z.string().min(16),
```

- [ ] **Step 2: Add to `.env.example`**

Edit `core-services/.env.example`, append:

```
# Admin dashboard: HS256 JWT signing secret (min 16 chars). Same value must be
# set in admin-dashboard's env as ADMIN_JWT_SECRET is only used server-side here.
ADMIN_JWT_SECRET=change-me-to-a-long-random-string
```

- [ ] **Step 3: Write the failing test — append to `core-services/test/smoke.ts`**

Add near the top, after the existing `process.env.*` assignments (before `const { buildApp } = ...`):

```ts
process.env.ADMIN_JWT_SECRET = 'test-admin-secret-please-ignore'
```

Then, after the existing `await app.close()` line but *before* `console.log('smoke ok')`, add:

```ts
// admin-auth: hash/verify + sign/verify round-trip
const { hashPassword, verifyPassword, signAdminToken, verifyAdminToken } = await import(
  '../src/lib/admin-auth.js'
)
const hash = hashPassword('correct horse battery staple')
assert.equal(verifyPassword('correct horse battery staple', hash), true)
assert.equal(verifyPassword('wrong password', hash), false)

const secret = process.env.ADMIN_JWT_SECRET!
const token = await signAdminToken('11111111-1111-1111-1111-111111111111', secret)
const adminId = await verifyAdminToken(token, secret)
assert.equal(adminId, '11111111-1111-1111-1111-111111111111')
await assert.rejects(() => verifyAdminToken('not-a-real-token', secret))
```

- [ ] **Step 4: Run to verify it fails**

Run: `pnpm smoke`
Expected: FAIL — `Cannot find module '../src/lib/admin-auth.js'`

- [ ] **Step 5: Implement `core-services/src/lib/admin-auth.ts`**

```ts
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'

// scrypt password hashing, stdlib only — no bcrypt dependency. Stored as
// "saltHex:hashHex" so verification needs no separate salt column.
const KEY_LEN = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, KEY_LEN)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(hashHex, 'hex')
  const actual = scryptSync(password, salt, KEY_LEN)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

// Stateless admin session token. `sub` = admin_users.id.
export async function signAdminToken(adminId: string, secret: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(secret))
}

export async function verifyAdminToken(token: string, secret: string): Promise<string> {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
  if (!payload.sub) throw new Error('Token missing subject')
  return payload.sub
}
```

- [ ] **Step 6: Run to verify it passes**

Run: `pnpm smoke`
Expected: `smoke ok` printed, exit code 0.

- [ ] **Step 7: Commit**

```bash
git add src/lib/admin-auth.ts src/env.ts .env.example test/smoke.ts
git commit -m "feat: add admin password hashing + JWT sign/verify"
```

---

### Task 3: `adminAuth` preHandler

**Files:**
- Modify: `core-services/src/plugins/auth.ts`

**Interfaces:**
- Consumes: `verifyAdminToken` from `lib/admin-auth.ts` (Task 2), `env.ADMIN_JWT_SECRET`.
- Produces: `adminAuth: preHandlerHookHandler`, sets `req.adminId: string`.

- [ ] **Step 1: Edit `core-services/src/plugins/auth.ts`**

Add import at top (after the `env` import):

```ts
import { verifyAdminToken } from '../lib/admin-auth.js'
```

Extend the `declare module 'fastify'` block:

```ts
declare module 'fastify' {
  interface FastifyRequest {
    privyId?: string
    agentId?: string
    adminId?: string
  }
}
```

Append at the end of the file:

```ts
/** Admin-dashboard (/admin) routes: require a valid admin JWT. */
export const adminAuth: preHandlerHookHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const token = bearer(req)
  if (!token) return reply.unauthorized('Missing bearer token')
  try {
    req.adminId = await verifyAdminToken(token, env.ADMIN_JWT_SECRET)
  } catch {
    return reply.unauthorized('Invalid token')
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/plugins/auth.ts
git commit -m "feat: add adminAuth preHandler"
```

---

### Task 4: Domain types for admin payloads

**Files:**
- Modify: `core-services/src/types/domain.ts`

**Interfaces:**
- Produces: widened `VaultStatus`/`FarmerStatus` (+ `'archived'`); `AdminVault`, `AdminFarmer`, `AdminPoaEvent`, `AdminHarvestEvent` types used by Task 6–8's routes and mirrored by admin-dashboard's `lib/types.ts` (Task 12).

- [ ] **Step 1: Edit `core-services/src/types/domain.ts`**

Change:

```ts
export type VaultStatus = 'active' | 'poa_due' | 'pending' | 'completed'
```

to:

```ts
export type VaultStatus = 'active' | 'poa_due' | 'pending' | 'completed' | 'archived'
```

Change:

```ts
export type FarmerStatus = 'verified' | 'pending' | 'new'
```

to:

```ts
export type FarmerStatus = 'verified' | 'pending' | 'new' | 'archived'
```

Append at the end of the file:

```ts
/* ──────────────────────────── Admin dashboard ──────────────────────────── */

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface AdminVault {
  id: string
  code: string
  cropKind: string
  cropLabel: string
  location: string
  status: VaultStatus
  dayCurrent: number
  dayTotal: number
  fundedIdr: number
  fundedUsd: number
  targetIdr: number | null
  targetUsd: number | null
  estApy: number | null
  farmerCount: number
  harvestEstimate: string | null
  milestones: Milestone[]
  iot: IoTSnapshot | null
  createdAt: string
  updatedAt: string
}

export interface AdminFarmer {
  id: string
  farmerCode: string
  name: string
  initials: string
  avatarColor: string
  idLine: string
  vaultLine: string
  vaultId: string | null
  status: FarmerStatus
  createdAt: string
  updatedAt: string
}

export interface AdminPoaEvent {
  id: string
  vaultId: string
  activity: PoaActivity
  photoCount: number
  lat: number | null
  lng: number | null
  note: string | null
  agentId: string | null
  status: ReviewStatus
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}

export interface AdminHarvestEvent {
  id: string
  vaultId: string
  kg: number
  grade: string
  note: string | null
  agentId: string | null
  status: ReviewStatus
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: no errors (widened unions are a superset, existing `toFieldVault`/`farmerRowToDomain` casts still compile).

- [ ] **Step 3: Commit**

```bash
git add src/types/domain.ts
git commit -m "feat: add admin domain types, widen status unions with 'archived'"
```

---

### Task 5: `lib/admin.ts` — row → domain mappers

**Files:**
- Create: `core-services/src/lib/admin.ts`

**Interfaces:**
- Consumes: `VaultRow` (from `lib/vaults.ts`), `FarmerRow` (from `lib/farmers.ts`), `AdminVault`/`AdminFarmer`/`AdminPoaEvent`/`AdminHarvestEvent` (Task 4).
- Produces: `toAdminVault(row: VaultRow): AdminVault`, `toAdminFarmer(row: FarmerRow): AdminFarmer`, `PoaEventRow`, `HarvestEventRow` interfaces, `toAdminPoaEvent(row: PoaEventRow): AdminPoaEvent`, `toAdminHarvestEvent(row: HarvestEventRow): AdminHarvestEvent`. Used by Tasks 6–8.

- [ ] **Step 1: Write `core-services/src/lib/admin.ts`**

```ts
import type { AdminFarmer, AdminHarvestEvent, AdminPoaEvent, AdminVault } from '../types/domain.js'
import type { VaultRow } from './vaults.js'
import type { FarmerRow } from './farmers.js'

export function toAdminVault(row: VaultRow): AdminVault {
  return {
    id: row.id,
    code: row.code,
    cropKind: row.crop_kind,
    cropLabel: row.crop_label,
    location: row.location,
    status: row.status as AdminVault['status'],
    dayCurrent: row.day_current,
    dayTotal: row.day_total,
    fundedIdr: row.funded_idr,
    fundedUsd: row.funded_usd,
    targetIdr: row.target_idr,
    targetUsd: row.target_usd,
    estApy: row.est_apy,
    farmerCount: row.farmer_count,
    harvestEstimate: row.harvest_estimate,
    milestones: row.milestones ?? [],
    iot: row.iot,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toAdminFarmer(row: FarmerRow): AdminFarmer {
  return {
    id: row.id,
    farmerCode: row.farmer_code,
    name: row.name,
    initials: row.initials,
    avatarColor: row.avatar_color,
    idLine: row.id_line,
    vaultLine: row.vault_line,
    vaultId: row.vault_id,
    status: row.status as AdminFarmer['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Mirrors `poa_events` after migration 0011 (adds status/reviewed_by/reviewed_at).
export interface PoaEventRow {
  id: string
  vault_id: string
  activity: string
  photo_count: number
  lat: number | null
  lng: number | null
  note: string | null
  agent_id: string | null
  status: string
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

// Mirrors `harvest_events` after migration 0011.
export interface HarvestEventRow {
  id: string
  vault_id: string
  kg: number
  grade: string
  note: string | null
  agent_id: string | null
  status: string
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export function toAdminPoaEvent(row: PoaEventRow): AdminPoaEvent {
  return {
    id: row.id,
    vaultId: row.vault_id,
    activity: row.activity as AdminPoaEvent['activity'],
    photoCount: row.photo_count,
    lat: row.lat,
    lng: row.lng,
    note: row.note,
    agentId: row.agent_id,
    status: row.status as AdminPoaEvent['status'],
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
  }
}

export function toAdminHarvestEvent(row: HarvestEventRow): AdminHarvestEvent {
  return {
    id: row.id,
    vaultId: row.vault_id,
    kg: row.kg,
    grade: row.grade,
    note: row.note,
    agentId: row.agent_id,
    status: row.status as AdminHarvestEvent['status'],
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/admin.ts
git commit -m "feat: add admin row-to-domain mappers"
```

---

### Task 6: `routes/admin/auth.ts` — login + route group wiring

**Files:**
- Create: `core-services/src/routes/admin/auth.ts`
- Create: `core-services/src/routes/admin/index.ts`
- Modify: `core-services/src/app.ts`
- Modify: `core-services/test/smoke.ts`

**Interfaces:**
- Consumes: `hashPassword`/`verifyPassword`/`signAdminToken` (Task 2), `adminAuth` (Task 3), `query`/`one` (`db/pool.ts`).
- Produces: `POST /admin/auth/login` → `{ token: string, admin: { id: string; email: string; name: string } }`; registers `/admin` prefix in `app.ts`.

- [ ] **Step 1: Write the failing test — append to `core-services/test/smoke.ts`**

Before `await app.close()`, add:

```ts
// Admin routes exist and are auth-gated (except login)
for (const url of ['/admin/vaults', '/admin/farmers']) {
  const r = await app.inject({ method: 'GET', url })
  assert.equal(r.statusCode, 401, `${url} should require an admin token`)
}
const badLogin = await app.inject({
  method: 'POST',
  url: '/admin/auth/login',
  payload: { email: 'nobody@panora.dev', password: 'wrong' },
})
assert.equal(badLogin.statusCode, 401)
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm smoke`
Expected: FAIL — `/admin/vaults` returns 404 (route group doesn't exist yet), not 401.

- [ ] **Step 3: Write `core-services/src/routes/admin/auth.ts`**

```ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { formatZodError } from '../../lib/validation.js'
import { one } from '../../db/pool.js'
import { verifyPassword, signAdminToken } from '../../lib/admin-auth.js'
import { env } from '../../env.js'

interface AdminUserRow {
  id: string
  email: string
  password_hash: string
  name: string
}

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function adminAuthRoutes(app: FastifyInstance) {
  app.post('/auth/login', async (req, reply) => {
    const p = loginBody.safeParse(req.body)
    if (!p.success) return reply.badRequest(formatZodError(p.error))
    try {
      const user = await one<AdminUserRow>('select * from admin_users where email = $1', [
        p.data.email,
      ])
      if (!user || !verifyPassword(p.data.password, user.password_hash)) {
        return reply.unauthorized('Invalid email or password')
      }
      const token = await signAdminToken(user.id, env.ADMIN_JWT_SECRET)
      return { token, admin: { id: user.id, email: user.email, name: user.name } }
    } catch (e) {
      return reply.internalServerError((e as Error).message)
    }
  })
}
```

- [ ] **Step 4: Write `core-services/src/routes/admin/index.ts`**

```ts
import type { FastifyInstance } from 'fastify'
import { adminAuth } from '../../plugins/auth.js'
import { adminAuthRoutes } from './auth.js'

// Admin-dashboard-facing routes. /auth/login is public; everything else
// requires a valid admin JWT.
export async function adminRoutes(app: FastifyInstance) {
  await app.register(adminAuthRoutes)
  app.addHook('preHandler', adminAuth)
  // adminVaultRoutes, adminFarmerRoutes, adminEventRoutes registered in Tasks 7-8
}
```

Note: `addHook('preHandler', adminAuth)` runs for every route registered on `app` **after** this line within the same plugin instance, but `adminAuthRoutes` was already registered via `app.register(...)` (a child scope) before the hook is added, so `/admin/auth/login` stays public while routes registered after the hook (added in Tasks 7–8) are gated. This mirrors how `app/index.ts`/`field/index.ts` gate their whole group — the difference here is one public sub-route.

- [ ] **Step 5: Wire into `core-services/src/app.ts`**

Add import:

```ts
import { adminRoutes } from './routes/admin/index.js'
```

Add registration (after the `fieldRoutes` line):

```ts
  await app.register(adminRoutes, { prefix: '/admin' }) // admin dashboard (JWT auth)
```

- [ ] **Step 6: Run to verify it passes**

Run: `pnpm smoke`
Expected: `smoke ok`. (`/admin/vaults` and `/admin/farmers` now 401 since the route group exists — even though the concrete vault/farmer handlers aren't registered yet, `adminAuth` runs as a preHandler hook on the whole group and fires before Fastify's 404 resolution for any path under `/admin` register scope... )

**Correction — verify actual behavior:** Fastify's `preHandler` hooks only run for routes that exist; an unregistered path still 404s. Since Tasks 7–8 haven't registered `/vaults`/`/farmers` handlers yet, `/admin/vaults` will 404, not 401, until Task 7 is done. Adjust Step 1's assertions to reflect this by moving them: keep only the `badLogin` assertion in this task's smoke addition, and add the `/admin/vaults`/`/admin/farmers` 401 assertions in Task 7's test step instead (once those routes exist to 401 against).

- [ ] **Step 6 (redo): Update `test/smoke.ts`**

Remove the `for (const url of ['/admin/vaults', '/admin/farmers'])` block added in Step 1 from this task (it moves to Task 7). Keep:

```ts
const badLogin = await app.inject({
  method: 'POST',
  url: '/admin/auth/login',
  payload: { email: 'nobody@panora.dev', password: 'wrong' },
})
assert.equal(badLogin.statusCode, 401)
```

Run: `pnpm smoke`
Expected: `smoke ok`.

- [ ] **Step 7: Commit**

```bash
git add src/routes/admin/auth.ts src/routes/admin/index.ts src/app.ts test/smoke.ts
git commit -m "feat: add admin login route and /admin route group"
```

---

### Task 7: `routes/admin/vaults.ts`

**Files:**
- Create: `core-services/src/routes/admin/vaults.ts`
- Modify: `core-services/src/routes/admin/index.ts`
- Modify: `core-services/test/smoke.ts`

**Interfaces:**
- Consumes: `toAdminVault` (Task 5), `VaultRow` (`lib/vaults.ts`), `AdminVault` (Task 4).
- Produces: `adminVaultRoutes(app: FastifyInstance)` registering `GET /vaults`, `GET /vaults/:id`, `POST /vaults`, `PATCH /vaults/:id`.

- [ ] **Step 1: Write the failing test — append to `core-services/test/smoke.ts`**

Before `await app.close()`, add:

```ts
for (const url of ['/admin/vaults', '/admin/farmers']) {
  const r = await app.inject({ method: 'GET', url })
  assert.equal(r.statusCode, 401, `${url} should require an admin token`)
}
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm smoke`
Expected: FAIL — `/admin/vaults` returns 404.

- [ ] **Step 3: Write `core-services/src/routes/admin/vaults.ts`**

```ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { formatZodError } from '../../lib/validation.js'
import { query, one } from '../../db/pool.js'
import { toAdminVault } from '../../lib/admin.js'
import type { VaultRow } from '../../lib/vaults.js'
import type { AdminVault } from '../../types/domain.js'

const listQuery = z.object({
  status: z.string().optional(),
  q: z.string().optional(),
})

const createBody = z.object({
  code: z.string().min(1),
  cropKind: z.enum(['chili', 'shallot', 'coffee', 'vanilla', 'rice', 'cacao']),
  cropLabel: z.string().min(1),
  location: z.string().min(1),
  status: z.enum(['active', 'poa_due', 'pending', 'completed']).default('pending'),
  dayTotal: z.number().int().positive(),
  targetIdr: z.number().optional(),
  targetUsd: z.number().optional(),
  estApy: z.number().optional(),
})

const patchBody = z.object({
  cropLabel: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  status: z.enum(['active', 'poa_due', 'pending', 'completed', 'archived']).optional(),
  dayCurrent: z.number().int().min(0).optional(),
  dayTotal: z.number().int().positive().optional(),
  targetIdr: z.number().optional(),
  targetUsd: z.number().optional(),
  estApy: z.number().optional(),
  harvestEstimate: z.string().optional(),
})

export async function adminVaultRoutes(app: FastifyInstance) {
  app.get('/vaults', async (req, reply): Promise<AdminVault[] | void> => {
    const p = listQuery.safeParse(req.query)
    if (!p.success) return reply.badRequest(formatZodError(p.error))
    try {
      const conditions: string[] = []
      const params: unknown[] = []
      if (p.data.status) {
        params.push(p.data.status)
        conditions.push(`status = $${params.length}`)
      }
      if (p.data.q) {
        params.push(`%${p.data.q}%`)
        conditions.push(`(code ilike $${params.length} or location ilike $${params.length})`)
      }
      const where = conditions.length ? `where ${conditions.join(' and ')}` : ''
      const rows = await query<VaultRow>(`select * from vaults ${where} order by code`, params)
      return rows.map(toAdminVault)
    } catch (e) {
      return reply.internalServerError((e as Error).message)
    }
  })

  app.get('/vaults/:id', async (req, reply): Promise<AdminVault | void> => {
    const { id } = req.params as { id: string }
    try {
      const row = await one<VaultRow>('select * from vaults where id = $1', [id])
      if (!row) return reply.notFound(`Vault ${id} not found`)
      return toAdminVault(row)
    } catch (e) {
      return reply.internalServerError((e as Error).message)
    }
  })

  app.post('/vaults', async (req, reply) => {
    const p = createBody.safeParse(req.body)
    if (!p.success) return reply.badRequest(formatZodError(p.error))
    try {
      const row = await one<VaultRow>(
        `insert into vaults
           (code, crop_kind, crop_label, location, status, day_total, target_idr, target_usd, est_apy)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *`,
        [
          p.data.code,
          p.data.cropKind,
          p.data.cropLabel,
          p.data.location,
          p.data.status,
          p.data.dayTotal,
          p.data.targetIdr ?? null,
          p.data.targetUsd ?? null,
          p.data.estApy ?? null,
        ],
      )
      return reply.code(201).send(toAdminVault(row as VaultRow))
    } catch (e) {
      return reply.internalServerError((e as Error).message)
    }
  })

  app.patch('/vaults/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const p = patchBody.safeParse(req.body)
    if (!p.success) return reply.badRequest(formatZodError(p.error))
    if (Object.keys(p.data).length === 0) return reply.badRequest('No fields to update')
    try {
      const existing = await one<VaultRow>('select * from vaults where id = $1', [id])
      if (!existing) return reply.notFound(`Vault ${id} not found`)

      const columnMap: Record<string, string> = {
        cropLabel: 'crop_label',
        location: 'location',
        status: 'status',
        dayCurrent: 'day_current',
        dayTotal: 'day_total',
        targetIdr: 'target_idr',
        targetUsd: 'target_usd',
        estApy: 'est_apy',
        harvestEstimate: 'harvest_estimate',
      }
      const sets: string[] = []
      const params: unknown[] = []
      for (const [key, value] of Object.entries(p.data)) {
        const column = columnMap[key]
        if (!column) continue
        params.push(value)
        sets.push(`${column} = $${params.length}`)
      }
      params.push(id)
      const row = await one<VaultRow>(
        `update vaults set ${sets.join(', ')} where id = $${params.length} returning *`,
        params,
      )
      return toAdminVault(row as VaultRow)
    } catch (e) {
      return reply.internalServerError((e as Error).message)
    }
  })
}
```

- [ ] **Step 4: Register in `core-services/src/routes/admin/index.ts`**

```ts
import type { FastifyInstance } from 'fastify'
import { adminAuth } from '../../plugins/auth.js'
import { adminAuthRoutes } from './auth.js'
import { adminVaultRoutes } from './vaults.js'

export async function adminRoutes(app: FastifyInstance) {
  await app.register(adminAuthRoutes)
  app.addHook('preHandler', adminAuth)
  await app.register(adminVaultRoutes)
  // adminFarmerRoutes, adminEventRoutes registered in Task 8
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm smoke`
Expected: FAIL still on `/admin/farmers` (not yet registered) — expected at this point; Task 8 covers it. Confirm the `/admin/vaults` assertion specifically now passes by running:

```bash
pnpm typecheck
```

Expected: no errors. (Full `pnpm smoke` green happens after Task 8; this task's own concern — `/admin/vaults` 401 — is validated by re-reading the assertion loop, since `assert.equal` inside a `for` loop throws on the first failing url and `/admin/vaults` is listed first.)

- [ ] **Step 6: Manual DB verification**

Against a real `DATABASE_URL` with migrations applied (Task 1) and a seeded admin (Task 9 provides the seed script — if running this step before Task 9 exists, insert a row by hand: `insert into admin_users (email, password_hash, name) values ('test@panora.dev', '<hash from hashPassword("test1234")>', 'Test Admin');` via a throwaway node script), start the server (`pnpm dev`) and run:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/admin/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"test@panora.dev","password":"test1234"}' | jq -r .token)

curl -s http://localhost:3000/admin/vaults -H "authorization: Bearer $TOKEN" | jq length
curl -s -X POST http://localhost:3000/admin/vaults -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"code":"TEST-001","cropKind":"chili","cropLabel":"Test Chili","location":"Test Loc","dayTotal":90}' | jq
curl -s -X PATCH http://localhost:3000/admin/vaults/<id-from-above> -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' -d '{"status":"archived"}' | jq .status
```

Expected: list returns an array; create returns 201 with the new vault; patch returns `"archived"`.

- [ ] **Step 7: Commit**

```bash
git add src/routes/admin/vaults.ts src/routes/admin/index.ts test/smoke.ts
git commit -m "feat: add admin vault CRUD routes"
```

---

### Task 8: `routes/admin/farmers.ts` + `routes/admin/events.ts`

**Files:**
- Create: `core-services/src/routes/admin/farmers.ts`
- Create: `core-services/src/routes/admin/events.ts`
- Modify: `core-services/src/routes/admin/index.ts`

**Interfaces:**
- Consumes: `toAdminFarmer`, `toAdminPoaEvent`, `toAdminHarvestEvent`, `PoaEventRow`, `HarvestEventRow` (Task 5); `FarmerRow` (`lib/farmers.ts`).
- Produces: `adminFarmerRoutes` (`GET /farmers`, `GET /farmers/:id`, `POST /farmers`, `PATCH /farmers/:id`); `adminEventRoutes` (`GET /vaults/:id/poa-events`, `GET /vaults/:id/harvest-events`, `PATCH /poa-events/:id`, `PATCH /harvest-events/:id`).

- [ ] **Step 1: Write the failing test — append to `core-services/test/smoke.ts`**

Extend the existing loop from Task 7 (already covers `/admin/farmers` 401). Add new assertions before `await app.close()`:

```ts
for (const url of [
  '/admin/vaults/v1/poa-events',
  '/admin/vaults/v1/harvest-events',
]) {
  const r = await app.inject({ method: 'GET', url })
  assert.equal(r.statusCode, 401, `${url} should require an admin token`)
}
const poaPatchGate = await app.inject({
  method: 'PATCH',
  url: '/admin/poa-events/e1',
  payload: { status: 'approved' },
})
assert.equal(poaPatchGate.statusCode, 401)
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm smoke`
Expected: FAIL — `/admin/farmers` and the new event routes 404 (not yet registered).

- [ ] **Step 3: Write `core-services/src/routes/admin/farmers.ts`**

```ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { formatZodError } from '../../lib/validation.js'
import { query, one } from '../../db/pool.js'
import { toAdminFarmer } from '../../lib/admin.js'
import { newFarmerFields } from '../../lib/farmers.js'
import type { FarmerRow } from '../../lib/farmers.js'
import type { AdminFarmer } from '../../types/domain.js'

const listQuery = z.object({
  status: z.string().optional(),
  vaultId: z.string().uuid().optional(),
  q: z.string().optional(),
})

const createBody = z.object({
  name: z.string().min(1),
  idLine: z.string().min(1),
  vaultLine: z.string().min(1),
  vaultId: z.string().uuid().optional(),
})

const patchBody = z.object({
  name: z.string().min(1).optional(),
  idLine: z.string().min(1).optional(),
  vaultLine: z.string().min(1).optional(),
  vaultId: z.string().uuid().nullable().optional(),
  status: z.enum(['verified', 'pending', 'new', 'archived']).optional(),
})

export async function adminFarmerRoutes(app: FastifyInstance) {
  app.get('/farmers', async (req, reply): Promise<AdminFarmer[] | void> => {
    const p = listQuery.safeParse(req.query)
    if (!p.success) return reply.badRequest(formatZodError(p.error))
    try {
      const conditions: string[] = []
      const params: unknown[] = []
      if (p.data.status) {
        params.push(p.data.status)
        conditions.push(`status = $${params.length}`)
      }
      if (p.data.vaultId) {
        params.push(p.data.vaultId)
        conditions.push(`vault_id = $${params.length}`)
      }
      if (p.data.q) {
        params.push(`%${p.data.q}%`)
        conditions.push(`(name ilike $${params.length} or farmer_code ilike $${params.length})`)
      }
      const where = conditions.length ? `where ${conditions.join(' and ')}` : ''
      const rows = await query<FarmerRow>(
        `select * from farmers ${where} order by created_at desc`,
        params,
      )
      return rows.map(toAdminFarmer)
    } catch (e) {
      return reply.internalServerError((e as Error).message)
    }
  })

  app.get('/farmers/:id', async (req, reply): Promise<AdminFarmer | void> => {
    const { id } = req.params as { id: string }
    try {
      const row = await one<FarmerRow>('select * from farmers where id = $1', [id])
      if (!row) return reply.notFound(`Farmer ${id} not found`)
      return toAdminFarmer(row)
    } catch (e) {
      return reply.internalServerError((e as Error).message)
    }
  })

  app.post('/farmers', async (req, reply) => {
    const p = createBody.safeParse(req.body)
    if (!p.success) return reply.badRequest(formatZodError(p.error))
    const fields = newFarmerFields(p.data.name, Math.floor(Math.random() * 9000) + 1000)
    try {
      const row = await one<FarmerRow>(
        `insert into farmers
           (farmer_code, name, initials, avatar_color, id_line, vault_line, vault_id, status)
         values ($1,$2,$3,$4,$5,$6,$7,'new') returning *`,
        [
          fields.farmer_code,
          p.data.name,
          fields.initials,
          fields.avatar_color,
          p.data.idLine,
          p.data.vaultLine,
          p.data.vaultId ?? null,
        ],
      )
      return reply.code(201).send(toAdminFarmer(row as FarmerRow))
    } catch (e) {
      return reply.internalServerError((e as Error).message)
    }
  })

  app.patch('/farmers/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const p = patchBody.safeParse(req.body)
    if (!p.success) return reply.badRequest(formatZodError(p.error))
    if (Object.keys(p.data).length === 0) return reply.badRequest('No fields to update')
    try {
      const existing = await one<FarmerRow>('select * from farmers where id = $1', [id])
      if (!existing) return reply.notFound(`Farmer ${id} not found`)

      const columnMap: Record<string, string> = {
        name: 'name',
        idLine: 'id_line',
        vaultLine: 'vault_line',
        vaultId: 'vault_id',
        status: 'status',
      }
      const sets: string[] = []
      const params: unknown[] = []
      for (const [key, value] of Object.entries(p.data)) {
        const column = columnMap[key]
        if (!column) continue
        params.push(value)
        sets.push(`${column} = $${params.length}`)
      }
      params.push(id)
      const row = await one<FarmerRow>(
        `update farmers set ${sets.join(', ')} where id = $${params.length} returning *`,
        params,
      )
      return toAdminFarmer(row as FarmerRow)
    } catch (e) {
      return reply.internalServerError((e as Error).message)
    }
  })
}
```

- [ ] **Step 4: Write `core-services/src/routes/admin/events.ts`**

```ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { formatZodError } from '../../lib/validation.js'
import { query, one } from '../../db/pool.js'
import { toAdminHarvestEvent, toAdminPoaEvent } from '../../lib/admin.js'
import type { HarvestEventRow, PoaEventRow } from '../../lib/admin.js'
import type { AdminHarvestEvent, AdminPoaEvent } from '../../types/domain.js'

const reviewBody = z.object({ status: z.enum(['approved', 'rejected']) })

export async function adminEventRoutes(app: FastifyInstance) {
  app.get('/vaults/:id/poa-events', async (req, reply): Promise<AdminPoaEvent[] | void> => {
    const { id } = req.params as { id: string }
    try {
      const rows = await query<PoaEventRow>(
        'select * from poa_events where vault_id = $1 order by created_at desc',
        [id],
      )
      return rows.map(toAdminPoaEvent)
    } catch (e) {
      return reply.internalServerError((e as Error).message)
    }
  })

  app.get('/vaults/:id/harvest-events', async (req, reply): Promise<AdminHarvestEvent[] | void> => {
    const { id } = req.params as { id: string }
    try {
      const rows = await query<HarvestEventRow>(
        'select * from harvest_events where vault_id = $1 order by created_at desc',
        [id],
      )
      return rows.map(toAdminHarvestEvent)
    } catch (e) {
      return reply.internalServerError((e as Error).message)
    }
  })

  app.patch('/poa-events/:id', async (req, reply): Promise<AdminPoaEvent | void> => {
    const { id } = req.params as { id: string }
    const p = reviewBody.safeParse(req.body)
    if (!p.success) return reply.badRequest(formatZodError(p.error))
    try {
      const existing = await one<PoaEventRow>('select * from poa_events where id = $1', [id])
      if (!existing) return reply.notFound(`PoA event ${id} not found`)
      if (existing.status !== 'pending') return reply.conflict(`Event already ${existing.status}`)
      const row = await one<PoaEventRow>(
        `update poa_events set status = $1, reviewed_by = $2, reviewed_at = now()
         where id = $3 returning *`,
        [p.data.status, req.adminId, id],
      )
      return toAdminPoaEvent(row as PoaEventRow)
    } catch (e) {
      return reply.internalServerError((e as Error).message)
    }
  })

  app.patch('/harvest-events/:id', async (req, reply): Promise<AdminHarvestEvent | void> => {
    const { id } = req.params as { id: string }
    const p = reviewBody.safeParse(req.body)
    if (!p.success) return reply.badRequest(formatZodError(p.error))
    try {
      const existing = await one<HarvestEventRow>('select * from harvest_events where id = $1', [id])
      if (!existing) return reply.notFound(`Harvest event ${id} not found`)
      if (existing.status !== 'pending') return reply.conflict(`Event already ${existing.status}`)
      const row = await one<HarvestEventRow>(
        `update harvest_events set status = $1, reviewed_by = $2, reviewed_at = now()
         where id = $3 returning *`,
        [p.data.status, req.adminId, id],
      )
      return toAdminHarvestEvent(row as HarvestEventRow)
    } catch (e) {
      return reply.internalServerError((e as Error).message)
    }
  })
}
```

Note: `reply.conflict` requires `@fastify/sensible` (already registered in `app.ts`), which provides `conflict` (409) alongside the `notFound`/`badRequest`/`unauthorized`/`internalServerError` helpers already used throughout the codebase.

- [ ] **Step 5: Register both in `core-services/src/routes/admin/index.ts`**

```ts
import type { FastifyInstance } from 'fastify'
import { adminAuth } from '../../plugins/auth.js'
import { adminAuthRoutes } from './auth.js'
import { adminVaultRoutes } from './vaults.js'
import { adminFarmerRoutes } from './farmers.js'
import { adminEventRoutes } from './events.js'

export async function adminRoutes(app: FastifyInstance) {
  await app.register(adminAuthRoutes)
  app.addHook('preHandler', adminAuth)
  await app.register(adminVaultRoutes)
  await app.register(adminFarmerRoutes)
  await app.register(adminEventRoutes)
}
```

- [ ] **Step 6: Run to verify it passes**

Run: `pnpm smoke`
Expected: `smoke ok`.

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 7: Manual DB verification**

With the server running and `TOKEN` set as in Task 7 Step 6:

```bash
curl -s http://localhost:3000/admin/farmers -H "authorization: Bearer $TOKEN" | jq length
VAULT_ID=$(curl -s http://localhost:3000/admin/vaults -H "authorization: Bearer $TOKEN" | jq -r '.[0].id')
curl -s "http://localhost:3000/admin/vaults/$VAULT_ID/poa-events" -H "authorization: Bearer $TOKEN" | jq
# submit a PoA via the field flow first if the list is empty, then:
EVENT_ID=$(curl -s "http://localhost:3000/admin/vaults/$VAULT_ID/poa-events" -H "authorization: Bearer $TOKEN" | jq -r '.[0].id')
curl -s -X PATCH "http://localhost:3000/admin/poa-events/$EVENT_ID" -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' -d '{"status":"approved"}' | jq
curl -s -X PATCH "http://localhost:3000/admin/poa-events/$EVENT_ID" -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' -d '{"status":"rejected"}' | jq
```

Expected: farmers list returns an array; poa-events list returns an array; first approve returns 200 with `status: "approved"`, `reviewedBy` set; second call (already approved) returns 409.

- [ ] **Step 8: Commit**

```bash
git add src/routes/admin/farmers.ts src/routes/admin/events.ts src/routes/admin/index.ts test/smoke.ts
git commit -m "feat: add admin farmer CRUD and event review routes"
```

---

### Task 9: `seed-admin` script

**Files:**
- Create: `core-services/scripts/seed-admin.ts`
- Modify: `core-services/package.json`

**Interfaces:**
- Consumes: `hashPassword` (Task 2), `pool` (`db/pool.ts`).
- Produces: `pnpm seed:admin <email> <password> [name]` — upserts a row into `admin_users`.

- [ ] **Step 1: Write `core-services/scripts/seed-admin.ts`**

```ts
// One-off admin bootstrap: pnpm seed:admin <email> <password> [name]
// No signup flow exists — this is the only way to create the first admin.
import { pool } from '../src/db/pool.js'
import { hashPassword } from '../src/lib/admin-auth.js'

const [email, password, name = 'Admin'] = process.argv.slice(2)

if (!email || !password) {
  console.error('Usage: pnpm seed:admin <email> <password> [name]')
  process.exit(1)
}

const passwordHash = hashPassword(password)

await pool.query(
  `insert into admin_users (email, password_hash, name)
   values ($1, $2, $3)
   on conflict (email) do update set password_hash = excluded.password_hash, name = excluded.name`,
  [email, passwordHash, name],
)

console.log(`Admin user ready: ${email}`)
await pool.end()
```

- [ ] **Step 2: Add script to `core-services/package.json`**

Edit the `scripts` object, add:

```json
    "seed:admin": "node --env-file=.env --import tsx scripts/seed-admin.ts",
```

- [ ] **Step 3: Run against a real DB and verify**

```bash
pnpm seed:admin admin@panora.dev "a-real-password-here" "Ops Admin"
psql "$DATABASE_URL" -c "select email, name from admin_users;"
```

Expected: `Admin user ready: admin@panora.dev` printed; `psql` shows the row.

Run again with the same email, different password:

```bash
pnpm seed:admin admin@panora.dev "a-different-password" "Ops Admin"
```

Expected: succeeds (upsert), no duplicate-key error.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-admin.ts package.json
git commit -m "feat: add seed-admin script for bootstrapping the first admin user"
```

---

### Task 10: Update `core-services/README.md`

**Files:**
- Modify: `core-services/README.md`

**Interfaces:** none (docs only).

- [ ] **Step 1: Fix stale claims and add the `/admin/*` section**

In the `## Run` section, add after the `.env` line:

```
cp .env.example .env   # fill DATABASE_URL (Neon), PRIVY_APP_ID, ADMIN_JWT_SECRET
pnpm seed:admin you@panora.dev "a-strong-password"   # first admin login
```

In the `### /field/*` table header, change `Auth: shared secret (x-api-key: <FIELD_API_KEY>)` (top of file) to `Auth: Privy access token (Authorization: Bearer <token>), same as /app` — this corrects the stale claim found during brainstorming (the codebase moved to `fieldPrivyAuth` already; only the README was out of date).

Add a new table after the `### /field/*` table:

```markdown
### `/admin/*` — admin dashboard (JWT, `Authorization: Bearer <token>`)

| Method | Path | Status |
|---|---|---|
| POST | `/admin/auth/login` | **live** — public, issues the JWT |
| GET/POST/PATCH | `/admin/vaults`, `/admin/vaults/:id` | **live** |
| GET/POST/PATCH | `/admin/farmers`, `/admin/farmers/:id` | **live** |
| GET | `/admin/vaults/:id/poa-events` · `/admin/vaults/:id/harvest-events` | **live** |
| PATCH | `/admin/poa-events/:id` · `/admin/harvest-events/:id` | **live** — approve/reject, audit-only (does not revert the vault) |
```

Update the `| File | Tables | Seed |` migrations table, add two rows:

```
| `0010_admin_users.sql` | `admin_users` | — |
| `0011_admin_review.sql` | — (adds columns to `vaults`, `farmers`, `poa_events`, `harvest_events`) | — |
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document /admin/* routes, fix stale field-auth claim"
```

---

### Task 11: Scaffold `admin-dashboard` Next.js app

**Files:**
- Create: everything under `admin-dashboard/` produced by `create-next-app` + `shadcn init` (package.json, tsconfig.json, next.config.ts, tailwind config, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `components.json`, `src/components/ui/*`)
- Create: `admin-dashboard/.env.local.example`

**Interfaces:**
- Produces: a running Next.js dev server; shadcn `button`, `input`, `label`, `table`, `badge`, `card`, `tabs`, `select`, `form`, `sonner`, `textarea` components available under `src/components/ui/`.

- [ ] **Step 1: Scaffold the app**

Run (from `admin-dashboard/`, which already has `.git` initialized from the brainstorming step):

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --eslint --no-git --use-pnpm
```

Expected: prompts skipped by flags, `package.json`/`src/app/*`/`tailwind.config.ts` created; existing `docs/` and `.git` untouched.

- [ ] **Step 2: Init shadcn/ui**

```bash
npx shadcn@latest init -d
npx shadcn@latest add button input label table badge card tabs select form sonner textarea
```

Expected: `components.json` created, `src/components/ui/*.tsx` populated with the listed components, `src/lib/utils.ts` created (shadcn's `cn` helper).

- [ ] **Step 3: Add form deps**

```bash
pnpm add react-hook-form @hookform/resolvers zod
```

- [ ] **Step 4: Write `admin-dashboard/.env.local.example`**

```
# core-services base URL (server-side only — never exposed to the browser)
CORE_SERVICES_URL=http://localhost:3000
```

Copy it: `cp .env.local.example .env.local` (edit if core-services runs elsewhere).

- [ ] **Step 5: Verify dev server boots**

```bash
pnpm dev
```

Expected: server starts on `http://localhost:3001` (or next free port), default Next.js page loads in a browser with no console errors. Stop the server (Ctrl+C) once confirmed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with shadcn/ui and form deps"
```

---

### Task 12: `lib/session.ts`, `lib/api.ts`, `lib/types.ts`

**Files:**
- Create: `admin-dashboard/src/lib/session.ts`
- Create: `admin-dashboard/src/lib/api.ts`
- Create: `admin-dashboard/src/lib/types.ts`

**Interfaces:**
- Produces: `getToken()`, `setToken(token)`, `clearToken()` (session.ts); `adminFetch<T>(path, init?)`, `class ApiError extends Error { status: number }` (api.ts); `AdminVault`, `AdminFarmer`, `AdminPoaEvent`, `AdminHarvestEvent`, `ReviewStatus`, `Milestone`, `IoTSnapshot` types mirroring `core-services/src/types/domain.ts` Task 4 additions (types.ts).
- Consumed by: every page/action task from here on (13–16).

- [ ] **Step 1: Write `admin-dashboard/src/lib/types.ts`**

```ts
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Milestone {
  id: string
  title: string
  subtitle: string
  state: 'done' | 'active' | 'pending'
  actionLabel?: string
}

export interface IoTSnapshot {
  temp: string
  humidity: string
  ph: string
  light: string
  lightOk: boolean
  updated: string
}

export type VaultStatus = 'active' | 'poa_due' | 'pending' | 'completed' | 'archived'
export type FarmerStatus = 'verified' | 'pending' | 'new' | 'archived'

export interface AdminVault {
  id: string
  code: string
  cropKind: string
  cropLabel: string
  location: string
  status: VaultStatus
  dayCurrent: number
  dayTotal: number
  fundedIdr: number
  fundedUsd: number
  targetIdr: number | null
  targetUsd: number | null
  estApy: number | null
  farmerCount: number
  harvestEstimate: string | null
  milestones: Milestone[]
  iot: IoTSnapshot | null
  createdAt: string
  updatedAt: string
}

export interface AdminFarmer {
  id: string
  farmerCode: string
  name: string
  initials: string
  avatarColor: string
  idLine: string
  vaultLine: string
  vaultId: string | null
  status: FarmerStatus
  createdAt: string
  updatedAt: string
}

export interface AdminPoaEvent {
  id: string
  vaultId: string
  activity: 'tanam' | 'pupuk' | 'rawat' | 'panen' | 'pemeriksaan'
  photoCount: number
  lat: number | null
  lng: number | null
  note: string | null
  agentId: string | null
  status: ReviewStatus
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}

export interface AdminHarvestEvent {
  id: string
  vaultId: string
  kg: number
  grade: string
  note: string | null
  agentId: string | null
  status: ReviewStatus
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}
```

- [ ] **Step 2: Write `admin-dashboard/src/lib/session.ts`**

```ts
import 'server-only'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'panora_admin_token'

export async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value ?? null
}

export async function setToken(token: string): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearToken(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export { COOKIE_NAME }
```

`server-only` is a dependency of Next.js itself (bundled), no separate install needed.

- [ ] **Step 3: Write `admin-dashboard/src/lib/api.ts`**

```ts
import 'server-only'
import { getToken } from './session'

const BASE_URL = process.env.CORE_SERVICES_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, body || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/session.ts src/lib/api.ts src/lib/types.ts
git commit -m "feat: add session cookie helpers, admin API client, shared types"
```

---

### Task 13: Auth — middleware, login page, login action

**Files:**
- Create: `admin-dashboard/middleware.ts`
- Create: `admin-dashboard/src/app/login/page.tsx`
- Create: `admin-dashboard/src/app/login/actions.ts`
- Modify: `admin-dashboard/src/app/page.tsx` (redirect `/` → `/vaults`)

**Interfaces:**
- Consumes: `setToken` (Task 12), `COOKIE_NAME` (Task 12).
- Produces: unauthenticated requests to any non-`/login` path redirect to `/login`; successful login sets the cookie and redirects to `/vaults`.

- [ ] **Step 1: Write `admin-dashboard/middleware.ts`**

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'panora_admin_token'
const PUBLIC_PATHS = new Set(['/login'])

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next()
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 2: Write `admin-dashboard/src/app/login/actions.ts`**

```ts
'use server'

import { redirect } from 'next/navigation'
import { setToken } from '@/lib/session'

const BASE_URL = process.env.CORE_SERVICES_URL ?? 'http://localhost:3000'

export interface LoginState {
  error?: string
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const res = await fetch(`${BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) return { error: 'Invalid email or password' }

  const { token } = (await res.json()) as { token: string }
  await setToken(token)
  redirect('/vaults')
}
```

- [ ] **Step 3: Write `admin-dashboard/src/app/login/page.tsx`**

```tsx
'use client'

import { useActionState } from 'react'
import { login, type LoginState } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const initialState: LoginState = {}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Panora Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Update `admin-dashboard/src/app/page.tsx`**

Replace the default `create-next-app` content with:

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/vaults')
}
```

- [ ] **Step 5: Manual verification**

With `core-services` running (`pnpm dev` in that repo, admin seeded per Task 9) and `admin-dashboard` running (`pnpm dev`):

1. Visit `http://localhost:3001/vaults` while logged out → expect redirect to `/login`.
2. Submit wrong credentials → expect "Invalid email or password" shown, no redirect.
3. Submit correct credentials → expect redirect to `/vaults` (404 page is fine — that page is built in Task 14).
4. Inspect cookies in devtools → `panora_admin_token` present, httpOnly.

- [ ] **Step 6: Commit**

```bash
git add middleware.ts src/app/login src/app/page.tsx
git commit -m "feat: add admin login flow with route protection middleware"
```

---

### Task 14: `components/status-badge.tsx` + Vaults list + Vaults new

**Files:**
- Create: `admin-dashboard/src/components/status-badge.tsx`
- Create: `admin-dashboard/src/app/vaults/page.tsx`
- Create: `admin-dashboard/src/app/vaults/actions.ts`
- Create: `admin-dashboard/src/app/vaults/new/page.tsx`

**Interfaces:**
- Consumes: `adminFetch`, `AdminVault` (Task 12).
- Produces: `StatusBadge({ status }: { status: string })`; `createVault(formData)` server action (used by `new/page.tsx`, reused by Task 15 for edit-adjacent create flows if any — none needed, but exported for consistency).

- [ ] **Step 1: Write `admin-dashboard/src/components/status-badge.tsx`**

```tsx
import { Badge } from '@/components/ui/badge'

const COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  poa_due: 'bg-amber-100 text-amber-800',
  pending: 'bg-slate-100 text-slate-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-neutral-200 text-neutral-600',
  verified: 'bg-green-100 text-green-800',
  new: 'bg-slate-100 text-slate-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={COLORS[status] ?? ''}>
      {status}
    </Badge>
  )
}
```

- [ ] **Step 2: Write `admin-dashboard/src/app/vaults/actions.ts`**

```ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { adminFetch } from '@/lib/api'
import type { AdminVault } from '@/lib/types'

export async function createVault(formData: FormData) {
  const vault = await adminFetch<AdminVault>('/admin/vaults', {
    method: 'POST',
    body: JSON.stringify({
      code: String(formData.get('code')),
      cropKind: String(formData.get('cropKind')),
      cropLabel: String(formData.get('cropLabel')),
      location: String(formData.get('location')),
      dayTotal: Number(formData.get('dayTotal')),
    }),
  })
  revalidatePath('/vaults')
  redirect(`/vaults/${vault.id}`)
}

export async function updateVault(id: string, patch: Record<string, unknown>) {
  await adminFetch<AdminVault>(`/admin/vaults/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  revalidatePath('/vaults')
  revalidatePath(`/vaults/${id}`)
}

export async function archiveVault(id: string) {
  await updateVault(id, { status: 'archived' })
  redirect('/vaults')
}
```

- [ ] **Step 3: Write `admin-dashboard/src/app/vaults/page.tsx`**

```tsx
import Link from 'next/link'
import { adminFetch } from '@/lib/api'
import type { AdminVault } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function VaultsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (q) params.set('q', q)
  const vaults = await adminFetch<AdminVault[]>(`/admin/vaults?${params.toString()}`)

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vaults</h1>
        <Button asChild>
          <Link href="/vaults/new">New vault</Link>
        </Button>
      </div>

      <form className="flex gap-2" method="get">
        <Input name="q" placeholder="Search code or location…" defaultValue={q ?? ''} />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Crop</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Farmers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vaults.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <Link href={`/vaults/${v.id}`} className="font-medium hover:underline">
                  {v.code}
                </Link>
              </TableCell>
              <TableCell>{v.cropLabel}</TableCell>
              <TableCell>{v.location}</TableCell>
              <TableCell>
                <StatusBadge status={v.status} />
              </TableCell>
              <TableCell>
                {v.dayCurrent}/{v.dayTotal}
              </TableCell>
              <TableCell>{v.farmerCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

- [ ] **Step 4: Write `admin-dashboard/src/app/vaults/new/page.tsx`**

```tsx
import { createVault } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CROP_KINDS = ['chili', 'shallot', 'coffee', 'vanilla', 'rice', 'cacao']

export default function NewVaultPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="text-2xl font-semibold">New vault</h1>
      <form action={createVault} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" required placeholder="CHILI-GH-BREBES-Q3" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cropKind">Crop kind</Label>
          <Select name="cropKind" required>
            <SelectTrigger id="cropKind">
              <SelectValue placeholder="Select crop" />
            </SelectTrigger>
            <SelectContent>
              {CROP_KINDS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cropLabel">Crop label</Label>
          <Input id="cropLabel" name="cropLabel" required placeholder="Chili — Greenhouse" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" required placeholder="Brebes, Central Java" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dayTotal">Cycle length (days)</Label>
          <Input id="dayTotal" name="dayTotal" type="number" min={1} required defaultValue={90} />
        </div>
        <Button type="submit">Create vault</Button>
      </form>
    </div>
  )
}
```

Note: shadcn's `Select` needs a `name` prop for native form submission to include its value in `FormData` — this is supported by the shadcn/Radix `Select` when `name` is passed to the top-level `Select` component (it renders a hidden input).

- [ ] **Step 5: Manual verification**

1. Log in, visit `/vaults` → list renders (empty or with existing rows).
2. Visit `/vaults/new`, submit a valid vault → redirected to `/vaults/<id>` (404 expected until Task 15 — confirm the vault was created by checking `/vaults` list shows it).
3. Search box filters by code/location substring.

- [ ] **Step 6: Commit**

```bash
git add src/components/status-badge.tsx src/app/vaults/page.tsx src/app/vaults/actions.ts src/app/vaults/new
git commit -m "feat: add vaults list, search, and create pages"
```

---

### Task 15: Vault detail page — edit form + PoA/Harvest review tabs

**Files:**
- Create: `admin-dashboard/src/app/vaults/[id]/page.tsx`
- Create: `admin-dashboard/src/app/vaults/[id]/vault-edit-form.tsx`
- Create: `admin-dashboard/src/app/vaults/[id]/event-review-list.tsx`
- Modify: `admin-dashboard/src/app/vaults/actions.ts` (+ `reviewPoaEvent`, `reviewHarvestEvent`)

**Interfaces:**
- Consumes: `adminFetch`, `AdminVault`, `AdminPoaEvent`, `AdminHarvestEvent` (Task 12); `updateVault`, `archiveVault` (Task 14).
- Produces: `reviewPoaEvent(id, status)`, `reviewHarvestEvent(id, status)` server actions.

- [ ] **Step 1: Add review actions to `admin-dashboard/src/app/vaults/actions.ts`**

Append:

```ts
export async function reviewPoaEvent(vaultId: string, eventId: string, status: 'approved' | 'rejected') {
  await adminFetch(`/admin/poa-events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  revalidatePath(`/vaults/${vaultId}`)
}

export async function reviewHarvestEvent(
  vaultId: string,
  eventId: string,
  status: 'approved' | 'rejected',
) {
  await adminFetch(`/admin/harvest-events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  revalidatePath(`/vaults/${vaultId}`)
}
```

- [ ] **Step 2: Write `admin-dashboard/src/app/vaults/[id]/vault-edit-form.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateVault, archiveVault } from '../actions'
import type { AdminVault } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function VaultEditForm({ vault }: { vault: AdminVault }) {
  const [cropLabel, setCropLabel] = useState(vault.cropLabel)
  const [location, setLocation] = useState(vault.location)
  const [dayCurrent, setDayCurrent] = useState(vault.dayCurrent)
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      try {
        await updateVault(vault.id, { cropLabel, location, dayCurrent })
        toast.success('Vault updated')
      } catch {
        toast.error('Update failed')
      }
    })
  }

  function archive() {
    startTransition(async () => {
      await archiveVault(vault.id)
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cropLabel">Crop label</Label>
        <Input id="cropLabel" value={cropLabel} onChange={(e) => setCropLabel(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dayCurrent">Day current</Label>
        <Input
          id="dayCurrent"
          type="number"
          min={0}
          value={dayCurrent}
          onChange={(e) => setDayCurrent(Number(e.target.value))}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={save} disabled={pending}>
          Save
        </Button>
        {vault.status !== 'archived' && (
          <Button onClick={archive} variant="destructive" disabled={pending}>
            Archive
          </Button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `admin-dashboard/src/app/vaults/[id]/event-review-list.tsx`**

```tsx
'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { reviewPoaEvent, reviewHarvestEvent } from '../actions'
import type { AdminPoaEvent, AdminHarvestEvent } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'

export function PoaEventReviewList({ vaultId, events }: { vaultId: string; events: AdminPoaEvent[] }) {
  const [pending, startTransition] = useTransition()

  function act(eventId: string, status: 'approved' | 'rejected') {
    startTransition(async () => {
      try {
        await reviewPoaEvent(vaultId, eventId, status)
        toast.success(`Event ${status}`)
      } catch {
        toast.error('Review failed')
      }
    })
  }

  if (events.length === 0) return <p className="text-sm text-muted-foreground">No PoA events.</p>

  return (
    <ul className="divide-y">
      {events.map((e) => (
        <li key={e.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium">
              {e.activity} · {e.photoCount} photos
            </p>
            <p className="text-sm text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={e.status} />
            {e.status === 'pending' && (
              <>
                <Button size="sm" disabled={pending} onClick={() => act(e.id, 'approved')}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={pending}
                  onClick={() => act(e.id, 'rejected')}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export function HarvestEventReviewList({
  vaultId,
  events,
}: {
  vaultId: string
  events: AdminHarvestEvent[]
}) {
  const [pending, startTransition] = useTransition()

  function act(eventId: string, status: 'approved' | 'rejected') {
    startTransition(async () => {
      try {
        await reviewHarvestEvent(vaultId, eventId, status)
        toast.success(`Event ${status}`)
      } catch {
        toast.error('Review failed')
      }
    })
  }

  if (events.length === 0) return <p className="text-sm text-muted-foreground">No harvest events.</p>

  return (
    <ul className="divide-y">
      {events.map((e) => (
        <li key={e.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium">
              {e.kg} kg · Grade {e.grade}
            </p>
            <p className="text-sm text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={e.status} />
            {e.status === 'pending' && (
              <>
                <Button size="sm" disabled={pending} onClick={() => act(e.id, 'approved')}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={pending}
                  onClick={() => act(e.id, 'rejected')}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 4: Write `admin-dashboard/src/app/vaults/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { adminFetch, ApiError } from '@/lib/api'
import type { AdminVault, AdminPoaEvent, AdminHarvestEvent } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VaultEditForm } from './vault-edit-form'
import { PoaEventReviewList, HarvestEventReviewList } from './event-review-list'

export default async function VaultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let vault: AdminVault
  try {
    vault = await adminFetch<AdminVault>(`/admin/vaults/${id}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound()
    throw e
  }

  const [poaEvents, harvestEvents] = await Promise.all([
    adminFetch<AdminPoaEvent[]>(`/admin/vaults/${id}/poa-events`),
    adminFetch<AdminHarvestEvent[]>(`/admin/vaults/${id}/harvest-events`),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{vault.code}</h1>
        <StatusBadge status={vault.status} />
      </div>

      <VaultEditForm vault={vault} />

      <Tabs defaultValue="poa">
        <TabsList>
          <TabsTrigger value="poa">PoA Events ({poaEvents.length})</TabsTrigger>
          <TabsTrigger value="harvest">Harvest Events ({harvestEvents.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="poa">
          <PoaEventReviewList vaultId={vault.id} events={poaEvents} />
        </TabsContent>
        <TabsContent value="harvest">
          <HarvestEventReviewList vaultId={vault.id} events={harvestEvents} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 5: Wire up `Toaster` for `sonner` toasts**

Edit `admin-dashboard/src/app/layout.tsx` — add the import and mount `<Toaster />` once, inside `<body>`, after `{children}`:

```tsx
import { Toaster } from '@/components/ui/sonner'
```

```tsx
        {children}
        <Toaster />
```

- [ ] **Step 6: Manual verification**

1. Visit `/vaults/<id>` for a vault created in Task 14 → edit form pre-filled, tabs show "PoA Events (0)" / "Harvest Events (0)".
2. Edit crop label, click Save → toast "Vault updated", `/vaults` list reflects the change on reload.
3. Using `field-app-v2` or a direct `curl` against `/field/vaults/:id/poa` (needs a real Privy agent token — skip if unavailable, note as a known gap and verify via manual DB insert instead: `insert into poa_events (vault_id, activity, photo_count) values ('<id>','tanam',3);`), confirm the new event shows as "pending" in the PoA tab.
4. Click Approve → toast, badge flips to "approved", buttons disappear. Reload page → state persists.
5. Click Archive → redirected to `/vaults`, vault no longer appears when filtering `?status=active` but does appear with no filter.

- [ ] **Step 7: Commit**

```bash
git add src/app/vaults/[id] src/app/vaults/actions.ts src/app/layout.tsx
git commit -m "feat: add vault detail page with edit form and PoA/harvest review"
```

---

### Task 16: Farmers list, new, and detail pages

**Files:**
- Create: `admin-dashboard/src/app/farmers/page.tsx`
- Create: `admin-dashboard/src/app/farmers/actions.ts`
- Create: `admin-dashboard/src/app/farmers/new/page.tsx`
- Create: `admin-dashboard/src/app/farmers/[id]/page.tsx`
- Create: `admin-dashboard/src/app/farmers/[id]/farmer-edit-form.tsx`

**Interfaces:**
- Consumes: `adminFetch`, `ApiError`, `AdminFarmer` (Task 12); `StatusBadge` (Task 14).
- Produces: `createFarmer(formData)`, `updateFarmer(id, patch)`, `archiveFarmer(id)` server actions.

- [ ] **Step 1: Write `admin-dashboard/src/app/farmers/actions.ts`**

```ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { adminFetch } from '@/lib/api'
import type { AdminFarmer } from '@/lib/types'

export async function createFarmer(formData: FormData) {
  const vaultId = String(formData.get('vaultId') ?? '')
  const farmer = await adminFetch<AdminFarmer>('/admin/farmers', {
    method: 'POST',
    body: JSON.stringify({
      name: String(formData.get('name')),
      idLine: String(formData.get('idLine')),
      vaultLine: String(formData.get('vaultLine')),
      ...(vaultId ? { vaultId } : {}),
    }),
  })
  revalidatePath('/farmers')
  redirect(`/farmers/${farmer.id}`)
}

export async function updateFarmer(id: string, patch: Record<string, unknown>) {
  await adminFetch<AdminFarmer>(`/admin/farmers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  revalidatePath('/farmers')
  revalidatePath(`/farmers/${id}`)
}

export async function archiveFarmer(id: string) {
  await updateFarmer(id, { status: 'archived' })
  redirect('/farmers')
}
```

- [ ] **Step 2: Write `admin-dashboard/src/app/farmers/page.tsx`**

```tsx
import Link from 'next/link'
import { adminFetch } from '@/lib/api'
import type { AdminFarmer } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function FarmersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (q) params.set('q', q)
  const farmers = await adminFetch<AdminFarmer[]>(`/admin/farmers?${params.toString()}`)

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Farmers</h1>
        <Button asChild>
          <Link href="/farmers/new">New farmer</Link>
        </Button>
      </div>

      <form className="flex gap-2" method="get">
        <Input name="q" placeholder="Search name or code…" defaultValue={q ?? ''} />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Vault</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {farmers.map((f) => (
            <TableRow key={f.id}>
              <TableCell>
                <Link href={`/farmers/${f.id}`} className="font-medium hover:underline">
                  {f.farmerCode}
                </Link>
              </TableCell>
              <TableCell>{f.name}</TableCell>
              <TableCell>{f.vaultLine}</TableCell>
              <TableCell>
                <StatusBadge status={f.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

- [ ] **Step 3: Write `admin-dashboard/src/app/farmers/new/page.tsx`**

```tsx
import { createFarmer } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewFarmerPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="text-2xl font-semibold">New farmer</h1>
      <form action={createFarmer} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Pak Sukarno" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="idLine">ID line</Label>
          <Input id="idLine" name="idLine" required placeholder="NIK 3329•••4521" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vaultLine">Vault line</Label>
          <Input id="vaultLine" name="vaultLine" required placeholder="Vault CHILI-GH-BREBES-Q2" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vaultId">Vault ID (optional)</Label>
          <Input id="vaultId" name="vaultId" placeholder="uuid — leave blank if unassigned" />
        </div>
        <Button type="submit">Create farmer</Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Write `admin-dashboard/src/app/farmers/[id]/farmer-edit-form.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateFarmer, archiveFarmer } from '../actions'
import type { AdminFarmer } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function FarmerEditForm({ farmer }: { farmer: AdminFarmer }) {
  const [name, setName] = useState(farmer.name)
  const [idLine, setIdLine] = useState(farmer.idLine)
  const [vaultLine, setVaultLine] = useState(farmer.vaultLine)
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      try {
        await updateFarmer(farmer.id, { name, idLine, vaultLine })
        toast.success('Farmer updated')
      } catch {
        toast.error('Update failed')
      }
    })
  }

  function archive() {
    startTransition(async () => {
      await archiveFarmer(farmer.id)
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="idLine">ID line</Label>
        <Input id="idLine" value={idLine} onChange={(e) => setIdLine(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vaultLine">Vault line</Label>
        <Input id="vaultLine" value={vaultLine} onChange={(e) => setVaultLine(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button onClick={save} disabled={pending}>
          Save
        </Button>
        {farmer.status !== 'archived' && (
          <Button onClick={archive} variant="destructive" disabled={pending}>
            Archive
          </Button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Write `admin-dashboard/src/app/farmers/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { adminFetch, ApiError } from '@/lib/api'
import type { AdminFarmer } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { FarmerEditForm } from './farmer-edit-form'

export default async function FarmerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let farmer: AdminFarmer
  try {
    farmer = await adminFetch<AdminFarmer>(`/admin/farmers/${id}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound()
    throw e
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{farmer.farmerCode}</h1>
        <StatusBadge status={farmer.status} />
      </div>
      <FarmerEditForm farmer={farmer} />
    </div>
  )
}
```

- [ ] **Step 6: Manual verification**

1. Visit `/farmers` → list renders.
2. `/farmers/new`, submit → redirected to `/farmers/<id>`, edit form pre-filled.
3. Edit name, Save → toast, list reflects change.
4. Archive → redirected to `/farmers`, filtering `?status=verified` excludes it.
5. Search box filters by name/code substring.

- [ ] **Step 7: Commit**

```bash
git add src/app/farmers
git commit -m "feat: add farmers list, create, and detail/edit pages"
```

---

## Plan Self-Review

**Spec coverage:**
- Architecture (Next.js ↔ core-services ↔ Postgres, stateless JWT) → Tasks 2, 3, 6, 11–13. ✓
- Data model changes (`admin_users`, review columns, archived status) → Task 1. ✓
- `/admin/auth/login` → Task 6. `/admin/vaults*` → Task 7. `/admin/farmers*` → Task 8. `/admin/*-events` → Task 8. ✓
- Admin pages (`/login`, `/vaults`, `/vaults/[id]`, `/vaults/new`, `/farmers`, `/farmers/[id]`, `/farmers/new`) → Tasks 13–16. ✓
- Error handling (401 → redirect, form validation, 409 idempotency guard) → Task 8 Step 4 (409), Task 13 (401 redirect via middleware), Tasks 14–16 (toast on ApiError). ✓
- Testing (smoke.ts extension, manual browser verification) → Tasks 2, 6–9 (smoke), every frontend task's "Manual verification" step. ✓
- Seed script for first admin → Task 9. ✓
- README update correcting stale docs → Task 10. ✓

**Type consistency check:** `AdminVault`/`AdminFarmer`/`AdminPoaEvent`/`AdminHarvestEvent` field names match exactly between `core-services/src/types/domain.ts` (Task 4), `core-services/src/lib/admin.ts` (Task 5), and `admin-dashboard/src/lib/types.ts` (Task 12) — verified field-by-field during writing (camelCase keys identical across both repos). `reviewPoaEvent`/`reviewHarvestEvent` signatures in Task 15 Step 1 match their call sites in `event-review-list.tsx` Step 3. `updateVault`/`archiveVault`/`createVault` signatures in Task 14 Step 2 match call sites in Task 15's `vault-edit-form.tsx`.

**Placeholder scan:** none found — every step has runnable code or an exact command with expected output.

**Gap flagged during writing:** Task 15 Step 6.3 notes that triggering a real PoA event requires a Privy agent token, which isn't available in this admin-only plan's scope — the manual verification step falls back to a direct SQL insert. This is a testing-convenience gap, not a functional gap: the review routes themselves don't depend on how the event got created.
