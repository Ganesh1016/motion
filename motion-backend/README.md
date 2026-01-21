# Motion - Task Management Service

A production-lean, locally runnable REST API backend for task management built with Node.js, Express, TypeScript, PostgreSQL (Neon), and Prisma.

## Features

- **Custom Authentication**: JWT-based auth with refresh tokens
- **Projects Management**: CRUD operations for user projects
- **Tasks Management**: Full task lifecycle with status tracking
- **Security**: bcrypt password hashing, helmet, rate limiting, CORS
- **Clean Architecture**: Controllers, services, and clear separation of concerns
- **Input Validation**: Zod schemas for all endpoints
- **IDOR Prevention**: All operations scoped to authenticated users
- **Soft Deletes**: Users, projects, and tasks are archived via `deletedAt`
- **Database**: PostgreSQL on Neon with Prisma ORM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Security**: helmet, express-rate-limit, cors
- **Logging**: morgan

## Project Structure

```
motion-backend/
├── prisma/
│   └── schema.prisma          # Prisma schema definition
├── src/
│   ├── config/
│   │   └── index.ts           # Configuration and env validation
│   ├── db/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication middleware
│   │   └── errorHandler.ts   # Global error handling
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── auth.routes.ts
│   │   ├── projects/
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts
│   │   │   ├── projects.validation.ts
│   │   │   └── projects.routes.ts
│   │   └── tasks/
│   │       ├── tasks.controller.ts
│   │       ├── tasks.service.ts
│   │       ├── tasks.validation.ts
│   │       └── tasks.routes.ts
│   ├── utils/
│   │   ├── auth.ts            # Auth utilities (hashing, JWT)
│   │   └── errors.ts          # Error classes and factories
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env.example               # Environment variables template
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (Neon account)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
cd motion-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` and set your Neon database URL and other configurations:

```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
```

### Neon Database Setup

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Paste it as `DATABASE_URL` in your `.env` file

The connection string format:
```
postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require
```

### Database Migration

Run Prisma migrations to set up the database schema:

```bash
npm run prisma:generate
npm run prisma:migrate
```

This will create the following tables:
- `users` - User accounts
- `refresh_tokens` - JWT refresh token storage
- `projects` - User projects
- `tasks` - Project tasks

### Running the Application

**Development mode** (with hot reload):

```bash
npm run dev
```

**Production build**:

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

### Verify Installation

Check the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-01-20T12:45:28.000Z",
    "environment": "development"
  }
}
```

## Database Schema

### User
- `id` (UUID, primary key)
- `email` (unique, indexed)
- `password` (hashed with bcrypt)
- `name` (optional)
- `createdAt`, `updatedAt`
- `deletedAt` (DateTime, nullable)

### RefreshToken
- `id` (UUID, primary key)
- `token` (hashed, unique, indexed)
- `userId` (foreign key → User)
- `expiresAt` (DateTime)
- `revoked` (boolean)
- `createdAt`

### Project
- `id` (UUID, primary key)
- `name` (required)
- `description` (optional)
- `userId` (foreign key → User, indexed)
- `createdAt`, `updatedAt`
- `deletedAt` (DateTime, nullable)

### Task
- `id` (UUID, primary key)
- `title` (required)
- `description` (optional)
- `status` (enum: TODO, IN_PROGRESS, DONE, BLOCKED)
- `projectId` (foreign key → Project, indexed)
- `createdAt`, `updatedAt`
- `deletedAt` (DateTime, nullable)
- Composite index on `(projectId, status)`

### Relationships

- User → Projects (one-to-many)
- Project → Tasks (one-to-many, soft delete cascade)
- User → RefreshTokens (one-to-many, cascade delete)

## API Documentation

See [API_CONTRACTS.md](./API_CONTRACTS.md) for complete API documentation including:
- Endpoint specifications
- Request/response examples
- Error formats
- Authentication requirements

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run lint` - Run ESLint

## Security Features

1. **Password Security**
   - bcrypt with 12 salt rounds
   - Strong password requirements enforced

2. **JWT Authentication**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Token rotation on refresh

3. **Rate Limiting**
   - Global: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes

4. **IDOR Prevention**
   - All queries scoped to authenticated user
   - Project ownership verified on all task operations

5. **Security Headers**
   - helmet middleware for common vulnerabilities

6. **Input Validation**
   - Zod schemas for all inputs
   - Sanitized error messages

## Design Decisions

### Authentication Strategy

- **JWT with refresh tokens**: Stateless access tokens for API calls, refresh tokens for renewal
- **Token rotation**: New refresh token issued on each refresh to detect token theft
- **Hashed storage**: Refresh tokens are hashed before storage

### IDOR Prevention

- **Project scoping**: All project queries include `userId` filter
- **Task scoping**: All task queries join through `project.userId`
- **Explicit ownership checks**: Services verify ownership before any write operation

### Error Handling

- **Consistent format**: All errors return standardized JSON
- **No stack traces in production**: Stack traces only in development
- **Meaningful messages**: User-friendly error messages
- **Proper HTTP codes**: 400, 401, 403, 404, 422, 500

### Soft Deletes

- Projects, tasks, and users are archived with a nullable `deletedAt` column.
- List and fetch queries exclude records where `deletedAt` is set.
- Deleting a project marks both the project and its tasks as deleted.

## Assumptions Made

1. **Single-user projects**: Each project has exactly one owner (no collaboration)
2. **No pagination**: Lists return all items (can add cursor/offset pagination)
3. **Client-side logout for access tokens**: Access tokens cannot be revoked server-side

## What Would Be Improved with More Time

### High Priority

1. **Email Service Integration**
   - Email verification on signup
   - Welcome emails

2. **Pagination**
   - Cursor-based pagination for tasks/projects lists
   - Limit and offset support

3. **Advanced Filtering**
   - Search tasks by title/description
   - Filter projects by date range
   - Sort options (createdAt, updatedAt, name)

4. **Restore/Retention**
   - Restore endpoints for soft-deleted records
   - Scheduled purge for hard deletes if needed

### Medium Priority

5. **Testing**
   - Unit tests for services
   - Integration tests for API endpoints
   - E2E tests with Supertest

6. **API Versioning**
   - `/api/v1/` prefix
   - Version negotiation

7. **Logging Improvements**
   - Structured logging with Winston/Pino
   - Log aggregation (Datadog, CloudWatch)
   - Request ID tracking

8. **Performance**
   - Redis caching for frequent queries
   - Database query optimization
   - Connection pooling tuning

### Nice to Have

9. **Documentation**
   - Swagger/OpenAPI spec
   - Auto-generated API docs
   - Architecture diagrams

10. **Monitoring**
    - Application Performance Monitoring (APM)
    - Error tracking (Sentry)
    - Metrics dashboards

11. **CI/CD**
    - GitHub Actions for tests
    - Automated deployment
    - Database migration automation

12. **Enhanced Security**
    - 2FA support
    - OAuth providers (Google, GitHub)
    - Session management UI
    - IP whitelisting

## Environment Variables

See `.env.example` for all available configuration options.

**Required:**
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Secret for access tokens (min 32 chars in production)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (min 32 chars in production)

**Optional:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed origins (comma-separated)
- Rate limiting configurations

## Troubleshooting

### Database Connection Issues

```
Error: Can't reach database server
```

**Solution**: Check your `DATABASE_URL` in `.env` is correct and Neon database is accessible.

### Prisma Client Not Generated

```
Error: @prisma/client did not initialize yet
```

**Solution**: Run `npm run prisma:generate`

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Change `PORT` in `.env` or kill the process using port 3000

### JWT Verification Errors

```
Error: Invalid token
```

**Solution**: Check that `JWT_SECRET` is consistent and tokens haven't expired

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
