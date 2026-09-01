"""
FastAPI service that serves the Week 5 issue-category classifier over HTTP.

Loads the trained model once at startup (not per-request — see README for
why that matters), exposes a /predict endpoint the React frontend calls,
and a /health endpoint for a quick liveness check.

Run from the ml/ folder:
    uvicorn service.main:app --reload --port 8000

Then open http://localhost:8000/docs for the interactive API docs.
"""

from contextlib import asynccontextmanager
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MODEL_PATH = Path(__file__).resolve().parent.parent / "model" / "issue_classifier.joblib"

# Holds the loaded model. Populated once at startup by the lifespan handler
# below, then reused for every request — never reloaded per-request.
model_state = {"model": None}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load the model once, before the app starts accepting requests.
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Model file not found at {MODEL_PATH}. Run `python train.py` "
            "from the ml/ folder first to produce it."
        )
    model_state["model"] = joblib.load(MODEL_PATH)
    print(f"Loaded model from {MODEL_PATH}")

    yield  # the app runs while paused here

    # Shutdown: nothing to clean up for a simple in-memory model, but this
    # is where you'd close DB connections etc. if there were any.
    model_state.clear()


app = FastAPI(
    title="DevFlow AI - Issue Classifier Service",
    description="Predicts an issue's category (bug / feature / question / documentation) from its title and description.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: without this, the browser blocks the React app's fetch calls to
# this service, exactly like the earlier Node backend CORS issue. The Vite
# dev server runs on 5173 by default.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class IssueInput(BaseModel):
    """
    Request body for a prediction. Pydantic validates this automatically —
    if `title` is missing or empty, or the wrong type, FastAPI rejects the
    request with a 422 before this code ever runs.
    """
    title: str = Field(..., min_length=1, description="The issue's title")
    description: str = Field(default="", description="Optional issue description")


class PredictionOutput(BaseModel):
    category: str
    confidence: float


@app.get("/health")
def health_check():
    """Simple liveness check — confirms the service is up and the model is loaded."""
    return {"status": "ok", "model_loaded": model_state["model"] is not None}


@app.post("/predict", response_model=PredictionOutput)
def predict_category(issue: IssueInput):
    model = model_state["model"]
    if model is None:
        # Shouldn't happen if startup succeeded, but guard anyway.
        raise HTTPException(status_code=503, detail="Model is not loaded")

    text = f"{issue.title} {issue.description}".strip()
    if not text:
        raise HTTPException(status_code=400, detail="Cannot predict from empty input")

    try:
        prediction = model.predict([text])[0]
        # predict_proba gives per-class probabilities; take the highest one
        # as the confidence score for the predicted class.
        probabilities = model.predict_proba([text])[0]
        confidence = float(max(probabilities))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not generate a prediction: {exc}")

    return PredictionOutput(category=prediction, confidence=round(confidence, 4))