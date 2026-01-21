# Motion Frontend

Minimal React + TypeScript UI for the Motion Task Management Service.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Run the dev server:

```bash
npm run dev
```

## Environment

- `VITE_API_BASE_URL`: Base URL for the backend API. Example: `http://localhost:3000/api`

## Folder structure

```
src/
  api/            API clients and request helpers
  components/     UI and feature components
  hooks/          UI hooks (toast helpers, etc.)
  lib/            Shared helpers and formatting
  pages/          Route-level pages
  store/          Auth storage and provider
  types/          Shared API types
```

## Auth handling assumptions

- Backend returns `accessToken` + `refreshToken` on login/register.
- Tokens are stored in localStorage to survive refreshes. Tradeoff: localStorage is vulnerable to XSS; for higher security, prefer httpOnly cookies or in-memory storage.
- Authenticated requests send a `Bearer` token. `credentials: 'include'` is enabled for cookie-based auth.
- Any `401` clears auth, shows a toast, and redirects to `/login`.

## Pagination & filtering

- Tasks are fetched per project. Status filtering is passed to the API when selected.
- Title search is client-side.
- Pagination is client-side with a page size of 10 or 20.
- State is persisted in URL query params:
  - `project`, `status`, `query`, `page`, `pageSize`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`