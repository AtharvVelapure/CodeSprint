# Production Readiness Update

## Security changes
- Added stateless Bearer JWT authentication (HS256) with server-side signature and expiry validation.
- Added BCrypt password hashing (strength 12).
- Existing plaintext development passwords are upgraded to BCrypt after the first successful login.
- Blocked users cannot authenticate even with a previously valid token.
- Added role-based authorization for ADMIN and authenticated USER APIs.
- Added ownership protection for common userId request parameters and user-specific URL paths.
- Run/Submit, CodeSpirit user chat, and Support ticket creation now derive the acting user from the authenticated JWT instead of trusting a client-supplied userId.
- Added JSON 401/403 responses.
- Centralized CORS configuration.

## Configuration changes
- Removed database and SMTP passwords from application.properties.
- DB, mail, Groq, JWT, CORS, upload directory, and frontend URL are configurable with environment variables.
- Assessment and Contest email links use FRONTEND_BASE_URL instead of hard-coded localhost.
- Disabled SQL logging by default.

## Required environment variables for local run
At minimum set DB_PASSWORD for your MySQL installation. If using email, set MAIL_USERNAME and MAIL_PASSWORD. If using CodeSpirit, set GROQ_API_KEY. For production always set JWT_SECRET to a random value of at least 32 characters.

Windows PowerShell example (replace values):
```powershell
$env:DB_PASSWORD="your_mysql_password"
$env:MAIL_USERNAME="your_email"
$env:MAIL_PASSWORD="your_app_password"
$env:GROQ_API_KEY="your_groq_key"
$env:JWT_SECRET="replace-with-a-long-random-secret-at-least-32-characters"
$env:FRONTEND_BASE_URL="http://localhost:5173"
```

## Frontend integration note
`POST /api/auth/login` keeps the existing user response fields and now additionally returns `token`. The frontend must store that token and send `Authorization: Bearer <token>` for protected API calls. Public problem/contest discovery and assessment invitation-token candidate routes remain accessible without a login JWT.

## Validation note
The source was statically scanned in this environment. A Maven executable/wrapper was not present in the uploaded project/runtime, so a full Maven compile could not be executed here. Run your normal Maven/Spring Boot build after extraction; if it reports a compiler error, send the output and it can be corrected directly.
