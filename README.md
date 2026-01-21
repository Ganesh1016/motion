# Motion

**Motion** is a production-ready task management platform built around authenticated projects and tasks.
It provides a secure REST API with JWT-based authentication and a minimal, responsive frontend designed for speed, clarity, and correctness.

The system is intentionally opinionated: single-owner projects, strict access boundaries, predictable data flow, and a calm UI that stays out of the way.

---

## Overview

**Backend**

- Node.js + Express + TypeScript
- PostgreSQL (Neon) with Prisma ORM
- JWT authentication with refresh token rotation
- Strict request validation and consistent error handling

**Frontend**

- React + TypeScript
- Tailwind CSS + shadcn/ui
- Fully responsive (mobile-first)
- Filtering, pagination, and optimistic UI updates
- Toast-based feedback for all user actions

---

## How to run

### Backend

```bash
cd motion-backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The API runs on `http://localhost:3000` by default.
A health check is available at `/health`.

### Frontend

```bash
cd motion-frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` in `motion-frontend/.env` if the backend is not running locally.

---

## Database schema (high level)

```
User (1) ────< Project (many) ────< Task (many)
  │
  ├───< RefreshToken (many)
```

### Core entities

**User**

- `id`
- `email`
- `password`
- `name`
- `createdAt`, `updatedAt`
- `deletedAt` (soft delete)

**Project**

- `id`
- `name`
- `description`
- `userId`
- `createdAt`, `updatedAt`
- `deletedAt`

**Task**

- `id`
- `title`
- `description`
- `status` (`to-do`, `in-progress`, `done`)
- `projectId`
- `createdAt`, `updatedAt`
- `deletedAt`

Soft deletes are implemented via nullable `deletedAt` columns.
All read queries explicitly exclude deleted records unless stated otherwise.

---

## Key design decisions and assumptions

### Security & access control

- JWT-based authentication with short-lived access tokens.
- Refresh tokens are rotated and stored server-side.
- Every project and task query is scoped to the authenticated user to prevent IDOR vulnerabilities.
- Authentication and authorization logic is centralized in middleware.

### Data integrity

- Prisma enforces relational constraints at the database level.
- Projects are single-owner by design.
- Tasks always belong to exactly one project.
- Deleting a project cascades soft deletion to its tasks.

### API behavior

- Strict input validation using Zod.
- Predictable HTTP status codes and structured error responses.
- No implicit behavior: missing or unauthorized resources always fail explicitly.

### Frontend architecture

- React Query handles data fetching, caching, retries, and pagination.
- URL query parameters control filtering and pagination for shareable state.
- UI state is kept minimal and local.
- All mutations provide immediate user feedback via toasts.

### Assumptions

- Projects are owned by a single user (no collaboration yet).
- Dataset size is small enough that client-side pagination is acceptable.
- The platform prioritizes clarity and correctness over feature density.

---

## What would improve with more time

### Backend

- **Server-side pagination and search** for large datasets.
- **Caching layer** (Redis or similar) for frequently accessed project/task reads.
- **Fine-grained rate limiting** and abuse protection per endpoint.
- **Background jobs** for cleanup of expired tokens and soft-deleted data.
- **Structured logging and tracing** with request IDs and centralized error tracking.
- **Comprehensive test suite** (unit, integration, and migration tests).

### Product & platform

- **Collaboration support**: shared projects, roles, and permissions.
- **Cross-project views**: global task lists, priorities, and deadlines.
- **Team and organization model** for multi-user ownership.
- **Activity audit logs** for compliance and debugging.
- **Webhook or event system** for integrations with external tools.
- **Performance optimizations** for high-concurrency environments.

### Frontend

- **Offline-first support** with background sync.
- **Keyboard-driven workflows** for power users.
- **Accessibility audit** and WCAG compliance improvements.
- **Design tokens and theming system** for consistent extensibility.

---

## Repository structure

```
motion-backend/    Express + Prisma REST API
motion-frontend/   React + Tailwind frontend
```
