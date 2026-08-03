# DevFlow AI — Backend (Week 2 complete)

An AI-powered developer workspace. This is the Week 2 REST API skeleton
for the capstone — a full CRUD API for the `issues` resource, built
with an in-memory store. Persistence (MongoDB) comes in a later week.

## Setup

```bash
npm install
npm start        # or: npm run dev  (auto-restarts on file changes)
```

Server runs on `http://localhost:5000` by default. Configure via `.env`
(see `.env.example`).

## Project structure

```
server.js                    # app setup, middleware wiring, entry point
routes/issueRoutes.js        # URL + method -> controller mapping only
controllers/issueController.js  # all business logic for /issues
middleware/requestLogger.js  # logs method, path, status, response time
middleware/validateIssue.js  # input validation for create/update
middleware/errorHandler.js   # centralized error -> JSON response
utils/ApiError.js            # custom error class (statusCode + message)
data/issues.js               # in-memory "database"
```

Routes and controllers are kept in separate files on purpose: routes
describe *what* URL triggers *which* function, controllers hold the
actual logic. That split makes each file easy to scan on its own, and
means the same controller logic could be reused behind a different
route path without duplicating anything.

## Endpoints

| Method | Endpoint | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/` | Health check | 200 | — |
| GET | `/api/issues` | Get all issues | 200 | — |
| GET | `/api/issues?status=open` | Filter issues by status | 200 | — |
| GET | `/api/issues/:id` | Get one issue by id | 200 | 404 if not found |
| POST | `/api/issues` | Create an issue (`title` required) | 201 | 400 if `title` missing/blank |
| PUT | `/api/issues/:id` | Update an issue (partial update) | 200 | 400 if `title` sent blank, 404 if not found |
| DELETE | `/api/issues/:id` | Delete an issue | 200 | 404 if not found |

**Example — create an issue:**
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -d '{"title":"Slow dashboard load","description":"Takes 8s with 50+ issues"}'
```

New issues are created with `category: null` and `priority: null` —
these get filled in later by the AI classification endpoint (Week 5+).

## Error shape

Every error response (validation, 404, or unexpected server error) has
the same consistent shape, produced by the centralized error handler:

```json
{
  "error": {
    "message": "Issue with id 999 not found",
    "status": 404
  }
}
```

## Middleware order (why it matters)

1. `express.json()` — parses JSON bodies
2. `requestLogger` — logs every request (method, path, status, time)
3. routes (`/`, `/api/issues`)
4. 404 catch-all — anything not matched above
5. `errorHandler` — registered LAST, catches everything thrown above it

## What's covered this week

- **Day 1:** Node fundamentals, npm, modules, `dotenv` for env vars
- **Day 2:** Express basics — routes, req/res, route params, query strings
- **Day 3:** Custom logging middleware
- **Day 4:** REST design — resource naming, status codes, routes/controllers split
- **Day 5:** Centralized input validation and error handling

## Tested

All five CRUD routes were manually verified with curl, including the
404 (nonexistent id) and 400 (missing/blank title) failure paths, and
the query-string filter (`?status=`). See `server.js` middleware order
above for how logging and error handling wrap every request.
