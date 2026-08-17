# capstone-app

DevFlow AI — an AI-powered developer workspace. Full project details
and architecture are documented per sub-folder below.

## Folder Structure

`backend/` — Express REST API for the `issues` resource (CRUD, validation,
  centralized error handling, MongoDB via Mongoose, JWT auth). Week 3
  complete. See `backend/README.md` for setup, endpoints, and project
  structure.
`frontend/` — React (Vite) frontend. Week 4 complete: register/login,
  protected issues view, create/edit/delete, React Router.
`ml/` — FastAPI classification service (not started yet)
`utils/` — Week 1 JavaScript utility functions

## Running frontend + backend together

1. **Backend** (from `backend/`):
   ```bash
   npm install
   cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
   npm run dev
   ```
   Runs on `http://localhost:5000`.

2. **Frontend** (from `frontend/`, in a second terminal):
   ```bash
   npm install
   cp .env.example .env   # VITE_API_URL defaults to http://localhost:5000/api
   npm run dev
   ```
   Runs on `http://localhost:5173`.

3. Open `http://localhost:5173`, register an account, and you'll land on
   the issues view. Only the issue owner sees edit/delete/status controls
   on a card.

## Files

dataUtils.js - Contains JavaScript utility functions.
test.js - Tests the utility functions.

## Technologies

JavaScript
Git
GitHub

