import { useState } from "react";
import { predictCategory } from "../api/mlClient";

const CATEGORIES = ["bug", "feature", "question", "documentation"];

export default function IssueForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState(null); // { category, confidence }
  const [suggestError, setSuggestError] = useState("");

  async function handleSuggest() {
    if (!title.trim()) {
      setSuggestError("Enter a title first");
      return;
    }
    setSuggesting(true);
    setSuggestError("");
    setSuggestion(null);
    try {
      const result = await predictCategory(title.trim(), description);
      setSuggestion(result);
    } catch (err) {
      // ML service down or rejected the input — don't block issue creation,
      // just surface the problem and let the user pick a category manually.
      setSuggestError(err.message);
    } finally {
      setSuggesting(false);
    }
  }

  function acceptSuggestion() {
    if (suggestion) setCategory(suggestion.category);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onCreate({
        title: title.trim(),
        description,
        category: category || null,
      });
      setTitle("");
      setDescription("");
      setCategory("");
      setSuggestion(null);
      setSuggestError("");
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

      <div className="category-row">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">No category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="button" className="btn-secondary" onClick={handleSuggest} disabled={suggesting}>
          {suggesting ? "Thinking..." : "Suggest category"}
        </button>
      </div>

      {suggestError && <p className="form-error">{suggestError}</p>}

      {suggestion && (
        <div className="suggestion-box">
          <span>
            Suggested: <strong>{suggestion.category}</strong>{" "}
            ({Math.round(suggestion.confidence * 100)}% confidence)
          </span>
          <button type="button" className="btn-link" onClick={acceptSuggestion}>
            Use this
          </button>
        </div>
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add issue"}
      </button>
    </form>
  );
}
