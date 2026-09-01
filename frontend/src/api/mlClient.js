// Separate from api/client.js on purpose: this talks to the FastAPI ML
// service (Python, port 8000) rather than the Express backend (Node, port
// 5000) — two different servers, so a different base URL and no auth token.

const ML_BASE_URL = import.meta.env.VITE_ML_API_URL || "http://localhost:8000";

export async function predictCategory(title, description) {
  let res;
  try {
    res = await fetch(`${ML_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
  } catch (err) {
    // The fetch itself failed — the ML service is unreachable (not running,
    // wrong URL, network down). This is distinct from the service running
    // but rejecting the input.
    throw new Error("Category suggestion is unavailable right now (ML service unreachable).");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // FastAPI validation errors (422) put details in data.detail, which can
    // be a string or a list of Pydantic error objects depending on the
    // failure — normalize both into a single readable message.
    const detail = Array.isArray(data?.detail)
      ? data.detail.map((d) => d.msg).join(", ")
      : data?.detail;
    throw new Error(detail || "Could not get a category suggestion");
  }

  return data; // { category, confidence }
}


