# CodeSprint full-stack local setup

## Backend
1. Open this project in Eclipse/IntelliJ/STS.
2. Make sure Java 21 and Maven are installed.
3. Create the MySQL database `Online_Coding_Platform`.
4. Check `src/main/resources/application.properties` for your local MySQL and mail settings.
5. Run `OnlineCodingPracticePlatformApplication`.
6. Backend runs on `http://localhost:8080`.

## Frontend
1. Open the frontend folder in a terminal.
2. Run `npm install` (do not copy an old `node_modules` folder between operating systems).
3. Run `npm run dev`.
4. Frontend runs on `http://localhost:5173`.

The Vite development server proxies `/api/*` to `http://localhost:8080`, so the React source uses relative `/api/...` URLs. The backend also has global CORS configuration for direct local requests.

## Important
The current backend authentication is application-level email/password checking and does not use JWT/session authentication. The security configuration therefore permits the existing API endpoints so the current application can communicate end-to-end. Add proper JWT/session authorization before deploying publicly.
