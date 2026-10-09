# Production-readiness upgrade

## Important security action
The original archive contained plaintext database and Gmail credentials in `application.properties`. They have been removed from this upgraded copy. Rotate/revoke those exposed credentials before using this project anywhere.

## Run locally
Set at minimum `DB_PASSWORD` and preferably `JWT_SECRET`. On Windows PowerShell:

```powershell
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="replace-with-a-long-random-secret-at-least-32-bytes"
./mvnw spring-boot:run
```

If this project has no Maven wrapper, use `mvn spring-boot:run`.

## Authentication contract
`POST /api/auth/login` returns the existing user fields plus `token` and `tokenType`. Send authenticated requests with:

`Authorization: Bearer <token>`

Existing legacy plaintext user passwords are upgraded to BCrypt automatically on successful login. New registrations and password changes use BCrypt immediately.

## Security rules
- `/api/auth/**`, certificate verification, health, and invitation-token assessment candidate endpoints are public.
- `/api/admin/**`, `/api/support/admin/**`, and `/api/assessment-host/admin/**` require ADMIN.
- Other API endpoints require a valid JWT.
- Sessions are stateless; CORS origins are environment-configurable.

## Before real production deployment
- Set all secrets through your deployment secret manager/environment. Never commit them.
- Use a strong random `JWT_SECRET` and HTTPS only.
- Replace `ddl-auto=update` with schema migrations (Flyway/Liquibase) and `validate` after migrations are introduced.
- Put MySQL on a private network and use a least-privilege DB user, not root.
- Run code-execution Docker workers on isolated infrastructure. The current Docker isolation is better than host execution, but production untrusted-code execution should be separated from the API host and additionally enforce process/output/storage quotas.
- Add rate limiting at the gateway/reverse proxy (especially login, OTP, AI, run/submit-code endpoints).
- Add automated integration/security tests and centralized monitoring before public launch.

## Frontend impact
The frontend must store/use the returned JWT and attach it as a Bearer token to protected API calls. That is the next integration step.
