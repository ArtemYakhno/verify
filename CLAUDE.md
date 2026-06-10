# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Verify** is a full-stack monorepo for managing galleries and images with authentication, role-based access control, admin invitation flows, media uploads, and soft-delete/restore/purge workflows.

- **Frontend**: React 19 + Vite + TypeScript (`apps/web`)
- **Backend**: NestJS 11 + TypeScript (`apps/api`)
- **Database**: PostgreSQL 16 via Prisma ORM
- **Media storage**: Cloudinary
- **Local email testing**: Mailpit (SMTP on port 1025, web UI on port 8025)
- **Monorepo tool**: pnpm workspaces
- **Package manager**: pnpm@10.33.2

## Repository Structure

```
verify/
├── apps/
│   ├── api/          # NestJS backend (port 3000)
│   └── web/          # React + Vite frontend (port 5173)
├── docker-compose.yml  # PostgreSQL service only
├── package.json        # Root scripts (dev, dev:api, dev:web)
├── pnpm-workspace.yaml
├── .env                # Single shared env file (not committed)
├── .env.example
└── README.md
```

## Quick Start

```bash
# One-time setup
pnpm install
docker-compose up -d
pnpm --filter api prisma migrate dev

# Development
pnpm dev                    # Start both API (port 3000) + web (port 5173)
pnpm dev:api               # Start backend only
pnpm dev:web               # Start frontend only
```

## Commands

All commands run from the repo root. Use `--filter api` or `--filter web` to target a workspace.

### Testing

```bash
pnpm --filter api test              # Run unit tests (watch)
pnpm --filter api test:e2e          # E2E tests
pnpm --filter api test:cov          # Coverage report
pnpm --filter web test:run          # Frontend tests (single run)
pnpm --filter web test:coverage     # Frontend coverage
```

### Linting & Formatting

```bash
pnpm --filter api lint              # ESLint + auto-fix
pnpm --filter api format            # Prettier
pnpm --filter web lint              # ESLint
```

### Build

```bash
pnpm --filter api build             # NestJS build
pnpm --filter web build             # Vite build (tsc-check + bundle)
```

### Database

```bash
pnpm --filter api prisma migrate dev    # Apply migrations
pnpm --filter api prisma generate       # Regenerate Prisma client
```

## Environment Setup

Copy `.env.example` to `.env` (repo root). Critical variables:

- `DATABASE_URL` — PostgreSQL connection string
- `VITE_API_URL` — API endpoint exposed to frontend (http://localhost:3000)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — signing keys
- `CLOUDINARY_*` — media upload credentials
- `EMAIL_HOST`, `EMAIL_PORT` — Mailpit SMTP (127.0.0.1:1025 locally)

Only `VITE_`-prefixed variables are exposed to browser code.

## Backend Architecture

### Entry Points
- `src/main.ts` — bootstraps NestJS app, calls `setupApp()`, listens on port 3000
- `src/app.module.ts` — imports all feature modules + ConfigModule (reads `../../.env`)
- `src/common/setup/app.setup.ts` — CORS, middleware, validation, exception filter, Swagger docs setup

### Modules & Responsibilities

| Module | Path | Responsibility |
|---|---|---|
| `PrismaModule` | `src/prisma/` | Singleton Prisma client |
| `AuthModule` | `src/auth/` | JWT login/register/refresh/logout, password hashing (Argon2) |
| `UsersModule` | `src/users/` | CRUD, admin invite flow, soft-delete |
| `ProfileModule` | `src/profile/` | Current user profile, password change |
| `GalleriesModule` | `src/galleries/` | CRUD, counters, owner-based access control |
| `ImagesModule` | `src/images/` | Upload (Cloudinary), move/copy, delete, access control |
| `CommonModule` | `src/common/` | Shared services: hash, cloudinary, mail, password-gen |

### Key Patterns

- **Auth**: `JwtAuthGuard` extracts Bearer token from header. Refresh token stored in HTTP-only cookie (`REFRESH_TOKEN_COOKIE`).
- **Access control**: `RolesGuard`, `GalleryAccessGuard`, `ImageAccessGuard` enforce permissions; `@Auth()` decorator shorthand for JWT guard.
- **Validation**: `UserExistPipe`, `GalleryExistPipe` validate entity existence before controller.
- **Soft delete**: Never hard-delete; use `deletedAt` + `DeletionReason` enum (`MANUAL` | `INHERIT`) on User, Gallery, Image.
- **Decorators**: `@CurrentUser()` extracts authenticated user; `@Roles()` for role-based gates.

### Prisma Schema
Located at `apps/api/prisma/schema.prisma`. Models: `User`, `Gallery`, `Image`. Enums: `Role` (`USER` | `ADMIN`), `DeletionReason` (`MANUAL` | `INHERIT`). Generated client output: `apps/api/generated/prisma`.

### Testing
Jest tests colocated in `__tests__/` subdirectories with `*.spec.ts` naming. Config: `rootDir: src`, `testEnvironment: node`, `ts-jest` transformer.

### Config
- **TypeScript**: target ES2023, `strictNullChecks: true`, `experimentalDecorators: true` for NestJS
- **ESLint**: `typescript-eslint` + type-checking, `eslint-plugin-prettier` recommended

## Frontend Architecture

### Entry & Routing
- `src/app/main.tsx` renders `<GlobalProvider />`
- `src/app/providers/GlobalProvider.tsx` wraps `QueryClientProvider` → `AuthInitializer` → `Root` (BrowserRouter)
- Protected routes require auth (`ProtectedRoute`); guest routes redirect authenticated users (`GuestRoute`)
- `InvalidIdGuard` validates route params; `GalleryOwnerGuard` restricts edits to owner

### Directory Layout

```
src/
├── app/
│   ├── layouts/       # DashboardLayout, AuthLayout
│   ├── modals/        # Global ActionModal, SuccessModal
│   ├── providers/     # GlobalProvider, AuthInitializer
│   └── routes/        # Router config, ProtectedRoute, GuestRoute
├── common/
│   ├── api/           # Axios client, auth/galleries/images/profile services
│   ├── components/    # shadcn/ui + custom blocks (PasswordChecklist, ActionsMenu)
│   ├── guards/        # React route guards
│   ├── hooks/         # useIsMobile, useScrolled, useGalleryOwner, useBack
│   ├── schemas/       # Shared Zod validation schemas
│   ├── stores/        # Zustand: auth.store.ts, success-modal.store.ts
│   ├── types/         # Shared TypeScript types
│   └── utils/         # globalLogout, parseApiResponse, test-utils
└── features/
    ├── auth/          # SignInForm, SignUpForm, mutations
    ├── galleries/     # Gallery pages, forms, queries, hooks, stores
    ├── images/        # Image schemas, mutations, queries
    ├── profile/       # Profile page, forms
    └── user-management/ # Admin panel
```

### State Management

- **Zustand** (with Immer + devtools): `auth.store.ts` (access token, auth status, initialized flag), `success-modal.store.ts`, `gallery-uploads.store.ts`
- **TanStack Query**: All server state via queries + mutations; key factories in `*.keys.ts` files

### API Client & Auth Flow

- `apiClient.ts` (Axios with `withCredentials: true` for cookie-based refresh)
- Request interceptor: attaches `Authorization: Bearer <token>` from Zustand
- Response interceptor: 401 triggers silent token refresh (queues concurrent requests, retries after refresh; calls `globalLogout()` on refresh failure)
- `AuthInitializer.tsx` calls `/auth/refresh` on mount to restore session, then prefetches profile

### Validation
Zod schemas colocated in feature `schemas/` folders. API responses parsed via `parseApiResponse()` utility for runtime safety.

### State in URL
Gallery list pagination, sort, and filters are persisted in query string (e.g., `?page=2&sort=name&filter=...`).

### Testing
Vitest + React Testing Library. Test files: `*.test.{ts,tsx}` in `__tests__/` or colocated. Global `@testing-library/jest-dom` matchers. Setup file: `src/test/setup.ts`. Wrapper utility: `queryWrapper.tsx` provides `QueryClientProvider`.

### Config
- **Vite**: `@` alias → `./src`; `envDir: ../../` (reads root `.env`); Vitest jsdom + globals
- **TypeScript**: tsconfig.app.json for app; strict null checks enabled
- **ESLint**: `typescript-eslint`, `react-hooks`, `react-refresh`

## Infrastructure

### Docker
`docker-compose.yml` defines only PostgreSQL (image `postgres:16`). Mailpit runs separately:
```bash
docker run -d --name mailpit --restart unless-stopped -p 8025:8025 -p 1025:1025 axllent/mailpit
```

### Development URLs
| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger docs | http://localhost:3000/api/docs |
| Mailpit UI | http://localhost:8025 |

## Key Conventions

- **Monorepo commands**: Most commands run from repo root; use `--filter api` or `--filter web` for workspace targeting
- **Never commit `.env`** — only `.env.example` is versioned
- **Prisma client** auto-generates on postinstall; manually run `pnpm --filter api prisma generate` if types are missing
- **Soft deletes only**: Always use `deletedAt` + `deletionReason`; never hard-delete
- **Path alias**: `@/` maps to `apps/web/src/`
- **TypeScript**: Frontend and backend have separate tsconfigs in their workspace roots
