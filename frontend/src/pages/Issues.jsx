import { useEffect, useState } from "react";
import { issuesApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import IssueForm from "../components/IssueForm";
import IssueList from "../components/IssueList";

export default function Issues() {
  const { token } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadIssues();
  }, []);

  async function loadIssues() {
    setLoading(true);
    setError("");
    try {
      const data = await issuesApi.getAll();
      setIssues(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(issue) {
    const created = await issuesApi.create(issue, token);
    setIssues((prev) => [created, ...prev]);
  }

  async function handleUpdate(id, updates) {
    const updated = await issuesApi.update(id, updates, token);
    setIssues((prev) => prev.map((i) => (i._id === id ? updated : i)));
  }

  async function handleDelete(id) {
    await issuesApi.remove(id, token);
    setIssues((prev) => prev.filter((i) => i._id !== id));
  }

  return (
    <div className="issues-page">
      <h1>Issues</h1>
      <IssueForm onCreate={handleCreate} />

      {loading && <p className="loading-state">Loading issues...</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && (
        <IssueList issues={issues} onUpdate={handleUpdate} onDelete={handleDelete} />
      )}
    </div>
  );
}
