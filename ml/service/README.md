# ml/service — FastAPI Prediction Service (Week 6)

Wraps the Week 5 trained model (`model/issue_classifier.joblib`) in a small
HTTP API so the React frontend can request live category predictions
instead of calling Python directly.

## What it does

- Loads the saved model **once**, at startup — not on every request. Loading
  a model from disk involves deserializing the TF-IDF vocabulary and
  classifier weights, which is comparatively slow; doing that on every
  request would add real latency to every single prediction and put
  unnecessary load on the server for no benefit, since the model doesn't
  change between requests.
- `POST /predict` — accepts `{ title, description }` as JSON, validated by a
  Pydantic model (`IssueInput`). If `title` is missing or empty, FastAPI
  rejects the request automatically with a `422` before any of your code
  even runs. Returns `{ category, confidence }`.
- `GET /health` — quick liveness check, confirms the service is up and the
  model loaded successfully.
- CORS is enabled for `http://localhost:5173` (the Vite dev server), so the
  browser doesn't block the frontend's fetch calls.
- `/docs` — FastAPI's automatic interactive API documentation (Swagger UI),
  generated directly from the Pydantic models and route type hints. No extra
  work needed to keep it in sync with the code — if you change a field on
  `IssueInput`, the docs update automatically next reload.

## Running it

```bash
cd ml
pip install -r requirements.txt

# from the ml/ folder:
uvicorn service.main:app --reload --port 8000
```

Then:
- `http://localhost:8000/docs` — try the endpoint interactively in the browser
- `http://localhost:8000/health` — should return `{"status":"ok","model_loaded":true}`

**Order matters when running the full app locally:** the Node backend
(`backend/`, port 5000), this FastAPI service (`ml/`, port 8000), and the
Vite frontend (`frontend/`, port 5173) are three separate processes — run
each in its own terminal. The FastAPI service needs `model/issue_classifier.joblib`
to already exist (from Week 5's `python train.py`) before it will start.

## Example request

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"title": "App crashes when I click submit twice", "description": "happens on Chrome"}'

# -> {"category": "bug", "confidence": 0.51}
```

Malformed input (missing title):
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"description": "no title here"}'

# -> HTTP 422, {"detail":[{"type":"missing","loc":["body","title"],"msg":"Field required",...}]}
```

## Frontend integration

`frontend/src/api/mlClient.js` calls this service from `IssueForm.jsx` — a
"Suggest category" button sends the current title/description, shows the
predicted category with its confidence score, and the user can accept it or
pick a category manually. If the service is down or unreachable, the fetch
failure is caught and shown as an inline message ("Category suggestion is
unavailable right now") — it never blocks creating the issue itself, since
category suggestion is a nice-to-have, not a requirement to submit.
