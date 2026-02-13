# Auth System Implementation Plan

## Context

The app currently has no auth. All routes and API endpoints are publicly accessible. We need a
single-admin auth system with:

- First-run setup wizard (if no users exist in DB)
- Login with username/password
- Warning when using the default `ADMIN_PASSWORD` env var password
- Route/API protection via middleware
- Schema designed for eventual RBAC multi-user expansion

---

## Libraries to Install

```bash
npm install jose bcryptjs
npm install -D @types/bcryptjs
```

- **`jose`** — JWT signing/verification (edge-runtime compatible, required for middleware)
- **`bcryptjs`** — password hashing (pure JS, no native deps)

---

## Environment Variables

Add to `.env` and document in `.env.example`:

```
JWT_SECRET=<generate: openssl rand -base64 32>
ADMIN_PASSWORD=changeme123
```

- **`JWT_SECRET`** — Signs and verifies JWT tokens. Must be a long random secret kept server-side only. Without it, tokens could be forged.
- **`ADMIN_PASSWORD`** — The default password seeded at first-run setup. User is warned to change it.

---

## Step 1: Prisma Schema — Add `User` model

**File:** `prisma/schema.prisma`

```prisma
model User {
  id                String   @id @default(uuid())
  fullName          String
  username          String   @unique
  email             String?  @unique
  passwordHash      String
  role              String   @default("admin")  // "admin" | future: "editor", "viewer"
  passwordChangedAt DateTime @default(now())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

Key design notes:
- `role` field added now — no-op for single user but ready for RBAC without a future migration
- `passwordChangedAt == createdAt` (set in same transaction at setup) → default password still in use
- UUID IDs — no fixed `id: "admin"` hack; supports multiple users later

After adding: `npx prisma db push`

---

## Step 2: Auth Utility — `lib/auth.ts`

Core auth module. JWT sign/verify helpers + cookie helpers. Used by middleware, API routes, and
Server Components.

```typescript
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "auth-token"
const JWT_EXPIRY = "7d"

function getSecret() {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error("JWT_SECRET not set")
  return new TextEncoder().encode(s)
}

export interface SessionPayload {
  sub: string      // user id
  username: string
  role: string     // "admin" | future roles
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionPayload
  } catch { return null }
}

// For middleware (NextRequest context — cannot use next/headers)
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// For Server Components / Route Handlers
export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export function authCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${7 * 24 * 3600}${secure}`
}

export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0`
}

export { COOKIE_NAME }
```

---

## Step 3: Middleware — `middleware.ts` (project root)

Single chokepoint for route protection. Runs on the edge — only uses `jose`, no Prisma.

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"

const PUBLIC = ["/login", "/setup", "/api/auth"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next()
  if (pathname.startsWith("/_next") || pathname.includes(".")) return NextResponse.next()

  const session = await getSessionFromRequest(req)
  if (!session) {
    if (pathname.startsWith("/api/"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const url = new URL("/login", req.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

API routes return `401 JSON`; page routes redirect to `/login?from=<original-path>`.

---

## Step 4: Route Group Restructure

Split into two route groups so auth pages don't render the app shell (sidebar/header):

```
app/
  (auth)/                        ← no layout; inherits root (html+body only)
    login/
      page.tsx                   ← Server Component
      login-form.tsx             ← Client Component
    setup/
      page.tsx                   ← Server Component
      setup-form.tsx             ← Client Component
  (app)/                         ← has app shell layout
    layout.tsx                   ← Sidebar + Header + DefaultPasswordBanner
    page.tsx                     ← (moved from app/page.tsx)
    categories/                  ← (moved)
    settings/                    ← (moved, add ChangePasswordForm)
    status/                      ← (moved)
  layout.tsx                     ← Root: html + body + Inter only
  api/
    auth/
      login/route.ts
      logout/route.ts
      setup/route.ts
      change-password/route.ts
    ...existing routes (unchanged)...
```

**Modified `app/layout.tsx`** — stripped to just html + body + font. Shell moves to `(app)/layout.tsx`.

**New `app/(app)/layout.tsx`:**
```tsx
import Sidebar from "@/components/layout/sidebar"
import Header from "@/components/layout/header"
import DefaultPasswordBanner from "@/components/auth/default-password-banner"

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DefaultPasswordBanner />
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## Step 5: API Routes

### `app/api/auth/setup/route.ts`
- `POST`: creates the first user (blocks with 409 if any user already exists)
- Reads password from `process.env.ADMIN_PASSWORD`, hashes with bcrypt (cost 12)
- Sets both `createdAt` and `passwordChangedAt` to the same `new Date()` → signals default password in use
- Validates: fullName required, username required + regex `/^[a-z0-9_]{3,30}$/`, email optional

### `app/api/auth/login/route.ts`
- `POST`: find user by username, `bcrypt.compare()`, sign JWT, set `auth-token` cookie
- Returns `{ usingDefaultPassword: boolean }` — true when `passwordChangedAt.getTime() === createdAt.getTime()`
- Includes `role` in JWT payload for future RBAC use
- Generic "Invalid credentials" message (no username enumeration)

### `app/api/auth/logout/route.ts`
- `POST`: sets `Max-Age=0` on cookie, returns `{ success: true }`

### `app/api/auth/change-password/route.ts`
- `POST`: verify current password, hash new password (bcrypt cost 12), update `passwordHash` + set `passwordChangedAt = new Date()`
- Now `passwordChangedAt != createdAt` → warning banner disappears
- Protected: calls `getSession()`, returns 401 if unauthenticated
- Validates: both fields required, new password min 8 chars

---

## Step 6: Setup Page

**`app/(auth)/setup/page.tsx`** (Server Component):
- Queries `prisma.user.count()` — if > 0, `redirect("/")`
- Renders `<SetupForm />`

**`app/(auth)/setup/setup-form.tsx`** (Client Component):
- Fields: Full Name (required), Username (required), Email (optional)
- Info note: "Initial password is set from the `ADMIN_PASSWORD` environment variable"
- On success → `router.push("/login?setup=complete")`

---

## Step 7: Login Page

**`app/(auth)/login/page.tsx`** (Server Component):
- If valid session → `redirect(from || "/")`
- If no users exist → `redirect("/setup")`
- Shows green "Account created" banner if `?setup=complete`
- Renders `<LoginForm from={...} />`

**`app/(auth)/login/login-form.tsx`** (Client Component):
- Fields: Username, Password
- On success with `usingDefaultPassword: true`: shows amber warning, then redirects after brief delay
- On success: `router.push(from || "/")` + `router.refresh()`

---

## Step 8: Default Password Warning Banner

**`components/auth/default-password-banner.tsx`** (Server Component):
- Calls `getSession()` + `prisma.user.findUnique()` (select only `passwordChangedAt`, `createdAt`)
- Renders amber banner if `passwordChangedAt.getTime() === createdAt.getTime()`
- Banner links to Settings (Change Password section)
- No client JS — disappears automatically after password change on next navigation

---

## Step 9: Header — Logout Button

**Modified `components/layout/header.tsx`**:
- Add `LogOut` icon button (lucide-react)
- `handleLogout`: `POST /api/auth/logout` → `router.push("/login")` + `router.refresh()`
- Keep existing dark mode toggle and New Task button

---

## Step 10: Change Password Form

**`components/auth/change-password-form.tsx`** (Client Component):
- Fields: Current Password, New Password (min 8), Confirm New Password
- Submits to `POST /api/auth/change-password`
- Success message: "Password changed. Warning will disappear on next page load."

**Modified `app/(app)/settings/page.tsx`**:
- Add a "Security" section at the bottom
- Import and render `<ChangePasswordForm />`

---

## Files Summary

### Create

| File | Purpose |
|---|---|
| `middleware.ts` | Route protection (project root) |
| `lib/auth.ts` | JWT + cookie utilities |
| `app/(app)/layout.tsx` | App shell layout |
| `app/(auth)/login/page.tsx` | Login page (Server Component) |
| `app/(auth)/login/login-form.tsx` | Login form (Client Component) |
| `app/(auth)/setup/page.tsx` | Setup page (Server Component) |
| `app/(auth)/setup/setup-form.tsx` | Setup form (Client Component) |
| `app/api/auth/login/route.ts` | Login endpoint |
| `app/api/auth/logout/route.ts` | Logout endpoint |
| `app/api/auth/setup/route.ts` | First-run setup endpoint |
| `app/api/auth/change-password/route.ts` | Password change endpoint |
| `components/auth/default-password-banner.tsx` | Default password warning (Server Component) |
| `components/auth/change-password-form.tsx` | Change password form (Client Component) |

### Move (into `(app)` route group)

| From | To |
|---|---|
| `app/page.tsx` | `app/(app)/page.tsx` |
| `app/categories/` | `app/(app)/categories/` |
| `app/settings/` | `app/(app)/settings/` |
| `app/status/` | `app/(app)/status/` |

### Modify

| File | Change |
|---|---|
| `prisma/schema.prisma` | Add `User` model |
| `app/layout.tsx` | Strip to html + body + Inter only |
| `app/(app)/settings/page.tsx` | Add `<ChangePasswordForm />` in Security section |
| `components/layout/header.tsx` | Add logout button |
| `.env` / `.env.example` | Add `JWT_SECRET`, `ADMIN_PASSWORD` |

---

## Multi-User RBAC Forward Compatibility

The schema is intentionally designed for easy expansion:

- `User.role` field already present (`"admin"` default) — add `"editor"`, `"viewer"` without migration
- `SessionPayload` includes `role` in every JWT — middleware can gate routes by role today
- UUID IDs throughout — no assumptions about single user
- `findUnique` / `findFirst` by username — query patterns scale to multiple users

---

## Verification

1. `npm install jose bcryptjs && npm install -D @types/bcryptjs`
2. Add `JWT_SECRET` and `ADMIN_PASSWORD` to `.env`
3. `npx prisma db push`
4. `npm run dev`
5. Visit `http://localhost:3000` → should redirect to `/setup`
6. Complete setup form → redirected to `/login?setup=complete`
7. Log in → amber warning banner appears (default password)
8. Go to Settings → change password → banner disappears on next load
9. Log out → redirected to `/login`
10. Verify API protection: `curl http://localhost:3000/api/tasks` → `401 Unauthorized`
