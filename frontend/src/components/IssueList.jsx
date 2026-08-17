import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const STATUS_LABELS = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}


export default function IssueList({ issues, onUpdate, onDelete }) {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  function startEdit(issue) {
    setEditingId(issue._id);
    setEditTitle(issue.title);
  }

  async function saveEdit(id) {
    if (!editTitle.trim()) return;
    await onUpdate(id, { title: editTitle.trim() });
    setEditingId(null);
  }

  async function changeStatus(issue, status) {
    await onUpdate(issue._id, { status });
  }

  if (issues.length === 0) {
    return <p className="empty-state">No issues yet. Add the first one above.</p>;
  }

  return (
    <ul className="issue-list">
      {issues.map((issue) => {
        const isOwner = user && issue.createdBy === user.id;
        return (
          <li key={issue._id} className={`issue-card status-${issue.status}`}>
            {editingId === issue._id ? (
              <div className="issue-edit-row">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <button onClick={() => saveEdit(issue._id)}>Save</button>
                <button className="btn-secondary" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="issue-main">
                  <h4>{issue.title}</h4>
                  <span className={`badge badge-${issue.status}`}>
                    {statusLabel(issue.status)}
                  </span>
                </div>
                {issue.description && <p>{issue.description}</p>}
                {isOwner && (
                  <div className="issue-actions">
                    <select
                      value={issue.status}
                      onChange={(e) => changeStatus(issue, e.target.value)}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <button className="btn-link" onClick={() => startEdit(issue)}>
                      Edit
                    </button>
                    <button
                      className="btn-link btn-danger"
                      onClick={() => onDelete(issue._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}