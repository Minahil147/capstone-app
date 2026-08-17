const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error?.message || "Something went wrong";
    throw new Error(message);
  }

  return data;
}

export const authApi = {
  register: (email, password) =>
    request("/auth/register", { method: "POST", body: { email, password } }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
};

export const issuesApi = {
  getAll: () => request("/issues"),
  create: (issue, token) =>
    request("/issues", { method: "POST", body: issue, token }),
  update: (id, updates, token) =>
    request(`/issues/${id}`, { method: "PUT", body: updates, token }),
  remove: (id, token) =>
    request(`/issues/${id}`, { method: "DELETE", token }),
};
