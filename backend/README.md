# DevFlow AI — Backend (Week 3: MongoDB, Mongoose, Auth)

An AI-powered developer workspace. The Week 2 in-memory CRUD API now
persists to MongoDB via Mongoose, and every write to `/api/issues`
requires a logged-in user.

## Setup

```bash
npm install
npm start        # or: npm run dev  (auto-restarts on file changes)
```

You need a running MongoDB instance (local `mongod`, or a free Atlas
cluster) before starting the server — it will refuse to boot without
a working `MONGO_URI`.

### Environment variables

Copy `.env.example` to `.env` and fill these in:

| Variable | What it's for |
|---|---|
| `PORT` | Port the server listens on (default 5000) |
| `MONGO_URI` | Mongo connection string, e.g. `mongodb://localhost:27017/devflow-ai` |
| `JWT_SECRET` | Signing key for JWTs — keep this out of git, use a long random string in production |
| `JWT_EXPIRES_IN` | How long a login token stays valid (e.g. `1d`) |

## Project structure
server.js # app setup, DB connect, middleware wiring, entry point
config/db.js # Mongoose connection
models/User.js # user schema, password hashing hook
models/Issue.js # issue schema (was data/issues.js in Week 2)
controllers/authController.js # register / login logic
controllers/issueController.js # CRUD logic for issues, now DB-backed
middleware/auth.js # requireAuth (JWT check), requireRole (role guard)
middleware/requestLogger.js # logs method, path, status, response time
middleware/validateIssue.js # input validation for create/update
middleware/errorHandler.js # centralized error -> JSON response
utils/ApiError.js # custom error class (statusCode + message)
utils/asyncHandler.js # wraps async controllers so thrown errors reach errorHandler
routes/authRoutes.js # /api/auth/register, /api/auth/login
routes/issueRoutes.js # /api/issues/*
## Auth flow

1. `POST /api/auth/register` with `{ email, password }`. The password
   is hashed with bcrypt in a Mongoose `pre("save")` hook before it's
   ever written to the DB — the plaintext password is never stored.
2. `POST /api/auth/login` with the same credentials. If the email
   exists and the password matches the stored hash, the server signs
   a JWT containing `{ id, role }` and returns it.
3. For any protected route, send that token as
   `Authorization: Bearer <token>`.
4. `middleware/auth.js` (`requireAuth`) verifies the token on every
   protected request and attaches the decoded payload to `req.user`,
   so controllers know who's making the request without re-checking
   credentials each time.
5. Ownership is enforced in the controller: `updateIssue` and
   `deleteIssue` compare `issue.createdBy` against `req.user.id` and
   reject with `403` if they don't match (unless the user's role is
   `admin`).

## Endpoints

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/` | No | Health check |
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/issues` | No | Get all issues (`?status=open` to filter) |
| GET | `/api/issues/mine` | Yes | Get only the logged-in user's issues |
| GET | `/api/issues/:id` | No | Get one issue by id |
| POST | `/api/issues` | Yes | Create an issue (`title` required) |
| PUT | `/api/issues/:id` | Yes, owner or admin | Update an issue (partial update) |
| DELETE | `/api/issues/:id` | Yes, owner or admin | Delete an issue |

**Example — register, log in, then create an issue:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"minahil@example.com","password":"password123"}'

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"minahil@example.com","password":"password123"}'
# -> { "token": "...", "user": {...} }

curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token from above>" \
  -d '{"title":"Slow dashboard load","description":"Takes 8s with 50+ issues"}'
```

Issues still get created with `category: null` and `priority: null` —
those get filled in by the AI classification endpoint later.

## Error shape

Unchanged from Week 2 — every error response has the same shape:

```json
{
  "error": {
    "message": "Issue with id 64f... not found",
    "status": 404
  }
}
```

A protected route with no token or a bad token returns:
```json
{ "error": { "message": "No token provided", "status": 401 } }
```

## What's covered this week

- **Day 1:** MongoDB concepts — documents, collections, when a document DB fits
- **Day 2:** Mongoose — schemas, models, basic queries
- **Day 3:** Data modeling — chose referencing over embedding for `Issue.createdBy`, since an issue always belongs to exactly one user and neither side needs to load nested inside the other
- **Day 4:** Authentication — bcrypt password hashing, signing and verifying JWTs
- **Day 5:** Authorization — `requireAuth` / `requireRole` middleware, ownership checks on update/delete

## Tested

Registered a user and logged in, confirming a token comes back.
Used that token to create an issue, verified the response includes
`createdBy` matching the logged-in user's id, and confirmed with
`server.js` logs that the request actually persisted to MongoDB
(not just held in memory). Still to confirm before final submission:
a restart keeping the data, a `401` on a protected route with no
token, and a `403` when a second user tries to edit the first
user's issue.
