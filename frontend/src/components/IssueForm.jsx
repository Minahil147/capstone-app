import { useState } from "react";

export default function IssueForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onCreate({ title: title.trim(), description });
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="issue-form" onSubmit={handleSubmit}>
      <h3>New issue</h3>
      {error && <p className="form-error">{error}</p>}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add issue"}
      </button>
    </form>
  );
}
