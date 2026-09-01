
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
    throw new Error("Category suggestion is unavailable right now (ML service unreachable).");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = Array.isArray(data?.detail)
      ? data.detail.map((d) => d.msg).join(", ")
      : data?.detail;
    throw new Error(detail || "Could not get a category suggestion");
  }

  return data; // { category, confidence }
}


