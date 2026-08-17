import { useEffect, useState } from "react";
import { issuesApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

const COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export default function Board() {
  const { token, user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dragOverColumn, setDragOverColumn] = useState(null);

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

  async function moveIssue(id, status) {
    const previous = issues;
    // optimistic update so the card moves instantly
    setIssues((prev) => prev.map((i) => (i._id === id ? { ...i, status } : i)));
    try {
      await issuesApi.update(id, { status }, token);
    } catch (err) {
      setIssues(previous); // revert on failure (e.g. not the owner)
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    const previous = issues;
    setIssues((prev) => prev.filter((i) => i._id !== id));
    try {
      await issuesApi.remove(id, token);
    } catch (err) {
      setIssues(previous);
      setError(err.message);
    }
  }

  function handleDragStart(e, issue) {
    e.dataTransfer.setData("text/plain", issue._id);
  }

  function handleDrop(e, columnKey) {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData("text/plain");
    const issue = issues.find((i) => i._id === id);
    if (issue && issue.status !== columnKey) {
      moveIssue(id, columnKey);
    }
  }

  if (loading) return <p className="loading-state">Loading board...</p>;

  return (
    <div className="board-page">
      <h1>Board</h1>
      {error && <p className="form-error">{error}</p>}

      <div className="board">
        {COLUMNS.map((col) => {
          const columnIssues = issues.filter((i) => i.status === col.key);
          return (
            <div
              key={col.key}
              className={`board-column ${dragOverColumn === col.key ? "drag-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumn(col.key);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className="board-column-header">
                <span>{col.label}</span>
                <span className="board-count">{columnIssues.length}</span>
              </div>

              <div className="board-column-body">
                {columnIssues.length === 0 && (
                  <p className="board-empty">Drop issues here</p>
                )}
                {columnIssues.map((issue) => {
                  const isOwner = user && issue.createdBy === user.id;
                  return (
                    <div
                      key={issue._id}
                      className="board-card"
                      draggable={isOwner}
                      onDragStart={(e) => handleDragStart(e, issue)}
                    >
                      <h4>{issue.title}</h4>
                      {issue.description && <p>{issue.description}</p>}
                      {isOwner && (
                        <div className="board-card-actions">
                          <button
                            className="btn-link btn-danger"
                            onClick={() => handleDelete(issue._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}