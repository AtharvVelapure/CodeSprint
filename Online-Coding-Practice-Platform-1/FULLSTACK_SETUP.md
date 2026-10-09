# CodeSprint backend local setup

- Java: 21
- Spring Boot: 4.1.1
- Backend port: 8080
- MySQL database: `Online_Coding_Platform`

The project includes `config/SecurityConfig.java` with CORS and preflight handling for the React development server. The MySQL JDBC URL has also been corrected to remove the accidental whitespace before the database name.

The current login implementation is custom email/password validation and does not issue JWTs. The security configuration permits the existing API endpoints so the current frontend/backend application can communicate. Add proper authentication/authorization before public deployment.
