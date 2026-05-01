
# Verify

Verify is a full-stack monorepo application with a React frontend and a NestJS backend.  


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

# Frontend
VITE_API_URL=http://localhost:3000
VITE_WEB_URL=http://localhost:5173
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

## Apply Migrations

After the database is running, apply Prisma migrations:

```bash
pnpm --filter api prisma migrate dev
```

The `migrate dev` command is used in development to create and apply migrations and generate artifacts such as Prisma Client. It prepares the local database schema so the backend can run correctly

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


## Troubleshooting

### Prisma client is missing

If Prisma types are missing or the project does not compile after cloning, run:

```bash
pnpm --filter api prisma generate
```

Prisma Client is generated code based on your Prisma schema, and it must exist for TypeScript imports and types to work correctly.

### Frontend does not read environment variables

Make sure the frontend is configured to read env variables from the monorepo root if you use a shared root `.env`. Also remember that only variables starting with `VITE_` are available in client-side code. 

## Notes

- Use `pnpm install` only once from the root of the monorepo.
- Do not commit the `.env` file.
- Commit `.env.example` so other developers can configure the project locally.
