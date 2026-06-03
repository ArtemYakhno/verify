# Verify

Verify is a full-stack monorepo application for managing galleries and images with authentication, admin flows, media uploads, and email-based user invitation scenarios.  
The project includes a React frontend and a NestJS backend, with PostgreSQL for persistence, Prisma as the ORM, Cloudinary for media storage, and Mailpit for local email testing in development.

## Features

- **JWT authentication** with access and refresh tokens; silent token refresh on the frontend — expired sessions are renewed automatically without logging the user out
- **Role-based access control** — two roles (`USER` / `ADMIN`); protected routes on both frontend and backend
- **User invitation flow** — admin creates a user account, a temporary password is generated and sent to the user's email automatically
- **Profile management** — users can update their personal details and change their password
- **Gallery management** — create, edit, and delete galleries with title and description
- **Image upload** — upload multiple images at once to a gallery; files are stored in Cloudinary
- **Image management** — edit image name and comment, move or copy images between galleries, delete individual images or clear an entire gallery at once
- **Search, sort, and filter** — gallery list supports real-time search by title, sorting by date / title / image count, and filtering by creation date range and image count range
- **URL-persisted state** — all pagination, sort, and filter parameters are stored in the URL; supports browser back/forward navigation and shareable filtered links
- **Soft delete** — users, galleries, and images are never permanently removed; deletion is tracked with a timestamp and a reason (`MANUAL` or `INHERIT`)
- **Restore** — soft-deleted galleries and images can be restored to their active state before being permanently purged
- **Purge** — permanently removes soft-deleted records and their associated Cloudinary assets from the database
- **Responsive UI** — adaptive layout for desktop and mobile; sorting and filtering use mobile-optimized bottom-sheet dialogs on small screens
- **Figma-designed** — UI built from a [Figma design](https://www.figma.com/design/0K7EG2mVMhfKr231R5sp61/Verify-Dashboard--Copy-?node-id=2634-56471&t=O06vMDkfwfqtXlAH-0)
- **API documentation** — Swagger UI available at `/api/docs` in development

## Tech Stack

### Frontend

- React
- TypeScript
- React Router
- Tanstask Query
- Zustand
- Zod
- React Hook Form
- Axios
- Tailwind
- shadcn
- vitest
- ESLint / Prettier

### Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Passport-JWT
- cookie-parser
- class-validator / class-transformer
- Swagger / OpenAPI
- Nodemailer
- Multer
- Cloudinary
- Jest
- ESLint / Prettier

### Infrastructure & Tooling

- pnpm workspaces
- Docker and Docker Compose
- Cloudinary
- Mailpit
- ESLint / TypeScript-based development workflow

Prisma is used as the ORM layer for database access in the NestJS backend, and Mailpit acts as a local SMTP server with a web interface for inspecting intercepted emails during development. Cloudinary is used for image and media-related workflows.

## Project Structure

```bash
verify/
├── apps/
│   ├── api/   # NestJS backend
│   └── web/   # React + Vite frontend
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

## Prerequisites

Before starting, make sure you have installed:

- Node.js 20+
- pnpm
- Docker + Docker Compose

## Environment Variables

The project uses a single root `.env` file.  
Create it from `.env.example` in the root of the repository.

```bash
cp .env.example .env
```

Example:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=verify
POSTGRES_PORT=5432
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/verify"

# App
NODE_ENV=development
COOKIE_DOMAIN=localhost

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_TOKEN_TTL=900
JWT_REFRESH_TOKEN_TTL=604800

# Links
VITE_API_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Mail
EMAIL_HOST=127.0.0.1
EMAIL_PORT=1025
EMAIL_FROM=no-reply@example.com
EMAIL_IGNORE_TLS=true
EMAIL_SECURE=false
EMAIL_REQUIRE_TLS=false
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_REPLY_TO=
```



## Installation

Run all commands from the repository root.

Install dependencies for all workspace packages:

```bash
pnpm install
```

Prisma Client is generated automatically after installation via the backend `postinstall` script.

## Database Setup

Start the PostgreSQL container:

```bash
docker compose up -d
```

This starts the database defined in `docker-compose.yml`.

#### Apply Migrations

After the database is running, apply Prisma migrations:

```bash
pnpm --filter api prisma migrate dev
```

The `migrate dev` command is used in development to create and apply migrations and generate artifacts such as Prisma Client. It prepares the local database schema so the backend can run correctly. [web:680]

## Mailpit Setup

For local email testing, you can run Mailpit in Docker. Mailpit acts as a local SMTP server, captures outgoing emails, and provides a web UI for viewing them in the browser. The default SMTP port is `1025`, and the default web UI port is `8025`.

Start Mailpit with:

```bash
docker run -d \
  --name mailpit \
  --restart unless-stopped \
  -p 8025:8025 \
  -p 1025:1025 \
  axllent/mailpit
```

Use the mail-related environment variables from the `.env` example so the backend sends emails to Mailpit instead of a real mail provider during development.

## Running the Project

Start both frontend and backend from the repository root:

```bash
pnpm dev
```

This runs both applications concurrently using the root scripts.

### Default URLs

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)

Swagger:

- API Docs: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

Mailpit:

- SMTP server: `127.0.0.1:1025`
- Mailpit UI: [http://localhost:8025](http://localhost:8025)

## Testing

### Frontend

The frontend uses **Vitest** as the test runner. Run tests with:

```bash
pnpm --filter web test
```

### Backend

The backend uses **Jest**  for unit tests. Run tests with:

```bash
pnpm --filter api test
```

## Troubleshooting

### Prisma client is missing

If Prisma types are missing or the project does not compile after cloning, run:

```bash
pnpm --filter api prisma generate
```

Prisma Client is generated code based on your Prisma schema, and it must exist for TypeScript imports and types to work correctly.

### Frontend does not read environment variables

Make sure the frontend is configured to read env variables from the monorepo root if you use a shared root `.env`. Also remember that only variables starting with `VITE_` are available in client-side code.

### Emails are not visible in development

Make sure Mailpit is running and that the backend mail configuration points to:

- `EMAIL_HOST=127.0.0.1`
- `EMAIL_PORT=1025`

Then open [http://localhost:8025](http://localhost:8025) to inspect captured emails. Mailpit is intended specifically for this local development workflow.

## Notes

- Use `pnpm install` only once from the root of the monorepo.
- Do not commit the `.env` file.
- Commit `.env.example` so other developers can configure the project locally.
