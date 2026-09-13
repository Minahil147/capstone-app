# DevFlow AI

A full-stack issue tracker with an ML-powered issue category classifier. Built as an 8-week capstone project (AI-Integrated Full-Stack Engineering).

## What it does

DevFlow AI lets teams create, track, and manage issues on a Kanban-style board. New issues are automatically classified into categories (e.g. bug, feature, docs) using a trained ML model, so you don't have to tag them manually.

- User authentication (JWT-based, bcrypt password hashing)
- Create / view / update / delete issues
- Drag-and-drop Kanban board (To Do / In Progress / Done)
- Automatic issue category prediction via a scikit-learn model (TF-IDF + Logistic Regression / Naive Bayes)

## Architecture

```
┌─────────────┐      REST API       ┌──────────────┐      Mongoose      ┌──────────┐
│   React     │ ─────────────────▶  │   Express    │ ─────────────────▶ │ MongoDB  │
│  (Vite)     │ ◀───────────────── │   Backend    │ ◀───────────────── │          │
└─────────────┘                     └──────┬───────┘                    └──────────┘
                                            │
                                            │ calls at issue creation
                                            ▼
                                     ┌──────────────┐
                                     │  ML Service  │
                                     │ (scikit-learn│
                                     │  classifier) │
                                     └──────────────┘
```

- **Frontend:** React + Vite, React Router v6, Context API for auth state, dark GitHub-inspired theme.
- **Backend:** Node/Express REST API, JWT auth middleware, Mongoose models for Users and Issues.
- **ML pipeline:** TF-IDF vectorizer + classifier trained on synthetic issue-text data, exposed to the backend for category prediction on new issues.

## Setup

### Option A — Docker (recommended, one command)

```bash
docker-compose up --build
```

This spins up MongoDB, the backend (port 5000), and the frontend (port 3000).

### Option B — Manual setup

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in your own values
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Run tests**
```bash
cd backend
npm test
```

## Environment variables

| Variable      | Description                          |
|---------------|---------------------------------------|
| `PORT`        | Port the backend runs on (default 5000) |
| `MONGO_URI`   | MongoDB connection string             |
| `JWT_SECRET`  | Secret used to sign JWT auth tokens   |

See `.env.example` for a template. Never commit your real `.env` file — it's excluded via `.gitignore`.

## Project structure

```
devflow-ai/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── app.js
│   └── server.js
├── frontend/
│   └── src/
├── ml-service/
├── docker-compose.yml
└── README.md
```

## What I'm proud of

Getting the ML classification pipeline talking to the Express backend cleanly — training the model separately, then wiring predictions into the issue-creation flow without slowing down the API response.

## What I'd improve with more time

Move the classifier to a proper standalone microservice with its own API instead of calling it in-process, so it can be retrained/redeployed independently of the backend.