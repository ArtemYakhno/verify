# 🖼️ Verify

Verify is a full-stack monorepo application for managing galleries and images with authentication, admin flows, media uploads, and email-based user invitation scenarios.  
The project includes a React frontend and a NestJS backend, with PostgreSQL for persistence, Prisma as the ORM, Cloudinary for media storage, and Mailpit for local email testing in development.

🔗 **Live Demo** → [Open link](https://verify-web-six.vercel.app/auth/sign-in) &nbsp;|&nbsp; 🎨 **Figma Design** → [Open in Figma](https://www.figma.com/file/0K7EG2mVMhfKr231R5sp61?node-id=2634-69406&type=design&mode=design&fuid=1392495306524358357) &nbsp;|&nbsp; 📖 **API Docs** → [Swagger UI](https://verify-api-h3wk.onrender.com/api/docs)

---

## ✨ Features

- 🔐 **JWT authentication** with access and refresh tokens; silent token refresh on the frontend — expired sessions are renewed automatically without logging the user out
- 🛡️ **Role-based access control** — two roles (`USER` / `ADMIN`); protected routes on both frontend and backend
- 📧 **User invitation flow** — admin creates a user account, a temporary password is generated and sent to the user's email automatically
- 👤 **Profile management** — users can update their personal details and change their password
- 🖼️ **Gallery management** — create, edit, and delete galleries with title and description
- ☁️ **Image upload** — upload multiple images at once to a gallery; files are stored in Cloudinary
- 🗂️ **Image management** — edit image name and comment, move or copy images between galleries, delete individual images or clear an entire gallery at once
- 🔎 **Search, sort, and filter** — gallery list supports real-time search by title, sorting by date / title / image count, and filtering by creation date range and image count range
- 🔗 **URL-persisted state** — all pagination, sort, and filter parameters are stored in the URL; supports browser back/forward navigation and shareable filtered links
- 🗑️ **Soft delete** — users, galleries, and images are never permanently removed; deletion is tracked with a timestamp and a reason (`MANUAL` or `INHERIT`)
- ♻️ **Restore** — soft-deleted galleries and images can be restored to their active state before being permanently purged
- 💣 **Purge** — permanently removes soft-deleted records and their associated Cloudinary assets from the database
- 📱 **Responsive UI** — adaptive layout for desktop and mobile; sorting and filtering use mobile-optimized bottom-sheet dialogs on small screens

---

## 🛠️ Tech Stack

### Frontend

- **React** — UI library
- **TypeScript** — type safety
- **React Router** — client-side routing
- **TanStack Query** — server state management & caching
- **Zustand** — client state management
- **React Hook Form + Zod** — form handling & validation
- **Axios** — API requests
- **Tailwind CSS + shadcn/ui** — styling & components
- **Vitest** — unit testing
- **ESLint / Prettier** — code quality

### Backend

- **NestJS** — server framework
- **TypeScript** — type safety
- **PostgreSQL** — database
- **Prisma ORM** — database access layer
- **Passport-JWT** — authentication strategy
- **class-validator / class-transformer** — request validation
- **Swagger / OpenAPI** — API documentation
- **Nodemailer** — email sending
- **Multer** — file upload handling
- **Cloudinary** — media storage
- **Jest** — unit testing
- **ESLint / Prettier** — code quality

### Infrastructure & Tooling

- **pnpm workspaces** — monorepo package management
- **Docker & Docker Compose** — containerized services
- **Cloudinary** — image & media storage
- **Mailpit** — local SMTP server for email testing

---

## 📁 Project Structure

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

---

## ⚙️ Prerequisites

Before implemented, make sure you have installed:

- Node.js 20+
- pnpm
- Docker + Docker Compose

---

## 🌱 Environment Variables

The project uses a single root `.env` file.  
Create it from `.env.example` in the root of the repository:

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

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
pnpm install
```

Prisma Client is generated automatically after installation via the backend `postinstall` script.

### 2. Start the database

```bash
docker compose up -d
```

### 3. Apply migrations

```bash
pnpm --filter api prisma migrate dev
```

### 4. Start Mailpit (local email testing)

```bash
docker run -d \
  --name mailpit \
  --restart unless-stopped \
  -p 8025:8025 \
  -p 1025:1025 \
  axllent/mailpit
```

### 5. Run the project

```bash
pnpm dev
```

---

## 🌐 Default URLs

| Service      | URL                                              |
| ------------ | ------------------------------------------------ |
| Frontend     | [http://localhost:5173](http://localhost:5173)   |
| Backend      | [http://localhost:3000](http://localhost:3000)   |
| Swagger UI   | [http://localhost:3000/api/docs](http://localhost:3000/api/docs) |
| Mailpit UI   | [http://localhost:8025](http://localhost:8025)   |

---

## 🧪 Testing

**Frontend** (Vitest):

```bash
pnpm --filter web test
```

**Backend** (Jest):

```bash
pnpm --filter api test
```

---

## 🔧 Troubleshooting

**Prisma client is missing**

```bash
pnpm --filter api prisma generate
```

**Frontend does not read environment variables**  
Make sure only variables prefixed with `VITE_` are used in client-side code.

**Emails not visible in development**  
Ensure Mailpit is running and `.env` contains:

```env
EMAIL_HOST=127.0.0.1
EMAIL_PORT=1025
```

Then open [http://localhost:8025](http://localhost:8025) to inspect captured emails.

---

## 📝 Notes

- Run `pnpm install` only once from the monorepo root.
- Do not commit the `.env` file.
- Commit `.env.example` so other developers can configure the project locally.

---

## 👤 Author

**Artem Yakhno**

- GitHub: [@ArtemYakhno](https://github.com/ArtemYakhno)
