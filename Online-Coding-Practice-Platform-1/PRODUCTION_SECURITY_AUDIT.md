# CodeSprint Backend Production/Security Audit

Audit date: 2026-09-29

## Changes applied

- Removed hard-coded database password and mail credentials from `application.properties`.
- Made `JWT_SECRET` mandatory and kept database/mail/AI/frontend settings environment-driven.
- Added `.env.example` with placeholder values only.
- Kept `spring.jpa.open-in-view=false` and removed controller-local CORS annotations in favor of centralized CORS.
- Removed debug `System.out`/`System.err` output and stack-trace printing from application services.
- Removed uploaded assessment-verification documents from the distributable source archive.
- Removed the obsolete `Assesment` CRUD controller/service/entity/repository that bypassed the verified-host assessment architecture.
- Admin dashboard now counts real `AssessmentAssignment` records rather than the obsolete assessment table.
- Restored candidate-driven assessment lifecycle synchronization so PUBLISHED can become LIVE without host refresh.
- Anchored the 48-hour assessment window to scheduled start time and supports direct PUBLISHED -> EXPIRED when first synchronized after the window.
- Restored the assessment invitation actor-vs-target identity exception while still validating the authenticated host actor.
- Invitation user search now verifies approved-host ownership of the assessment.
- Expired assessments can retain invitation-history viewing while new/resend invitation management remains blocked.
- Restored DTO responses for hints/editorials/test cases to avoid lazy proxy serialization with OSIV disabled.
- Protected hidden test-case reads as ADMIN-only.
- Protected the admin editorial endpoint so normal users cannot bypass editorial unlock rules.
- Restricted raw submission collection/create/delete endpoints to ADMIN; single-submission reads now enforce owner-or-admin.
- Restricted all-contest-submissions endpoint to ADMIN.
- Certification attempt read/submit by attempt ID now enforces owner-or-admin.
- Admin certificate listing now returns DTOs instead of lazy JPA entities and is ADMIN-only.
- Contest problem administration now returns DTOs rather than lazy JPA entities, avoiding entity/proxy serialization and user-object leakage.
- Added basic registration/login request validation and normalized registration/login email values.
- Default Spring error responses are configured not to expose stack traces/internal messages.

## Security model retained

- Stateless JWT authentication.
- BCrypt password hashing and legacy plaintext migration at successful login.
- USER/ADMIN role checks.
- User identity protection for path/query `userId` parameters.
- Public candidate assessment endpoints remain invitation-token based.
- Global exception handler returns controlled 400/403/404/409/500 responses.

## Required environment variables

At minimum for a normal local/production run configure:

- `DB_PASSWORD`
- `MAIL_USERNAME` and `MAIL_PASSWORD` when email features are used
- `GROQ_API_KEY` when CodeSpirit AI is used
- `JWT_SECRET` (required, at least 32 characters)
- `FRONTEND_BASE_URL` and `CORS_ALLOWED_ORIGINS` for the deployed frontend

See `.env.example` for the complete list.

## Verification note

Static source/security checks were completed in the packaging environment. The environment does not contain Maven or the project dependency cache, so a full Maven dependency-aware compile could not be executed here. Run `mvn clean test` (or Eclipse/IDE Maven build) after extraction before deployment, then perform the existing USER/ADMIN/candidate regression checklist.
