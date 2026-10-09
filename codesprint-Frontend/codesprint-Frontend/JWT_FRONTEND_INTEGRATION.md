# JWT Frontend Integration

This frontend is integrated with the JWT-secured Spring Boot backend.

## Authentication
- Login stores the backend login response (including `token`) in `localStorage` under `user`.
- Axios requests automatically send `Authorization: Bearer <token>`.
- Existing `fetch` requests also automatically send the same Bearer token.
- A 401 response clears the local login and redirects to `/login` for normal authenticated application routes.
- Candidate assessment invitation routes are excluded from automatic 401 logout because they use invitation-token security.
- 403 responses remain visible to the calling page and do not automatically log the user out.

## Route protection
- `UserLayout` requires a valid stored token and `USER` role.
- `AdminLayout` requires a valid stored token and `ADMIN` role.
- Candidate assessment invitation routes remain outside those JWT route guards.
- Contest registration remains outside the layout guard so its existing login-return flow continues to work.

## API URL
Use `VITE_API_URL` for deployed environments. During local Vite development it may remain empty; `/api` is proxied to `http://localhost:8080` by `vite.config.js`.

Copy `.env.example` to `.env` only when you need an environment-specific API URL. Never put JWTs or backend secrets in Vite environment variables.
