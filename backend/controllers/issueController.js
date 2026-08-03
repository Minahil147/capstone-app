// Day 4 concept: separating routes from controllers.
// routes/issueRoutes.js just says WHICH function handles WHICH URL.
// This file has the actual logic for each one. That separation means
// you can find "what does GET /issues/:id do" by reading one short
// function, without wading through Express route-registration code.

const issues = require("../data/issues");
const ApiError = require("../utils/ApiError");

// tracks the next id to hand out, since this is an in-memory store
let nextId = issues.length + 1;

// GET /api/issues
// GET /api/issues?status=open
function getAllIssues(req, res) {
  const { status } = req.query;

  if (status) {
    const filtered = issues.filter((issue) => issue.status === status);
    return res.status(200).json(filtered);
  }

  res.status(200).json(issues);
}

// GET /api/issues/:id
function getIssueById(req, res) {
  const id = Number(req.params.id);
  const issue = issues.find((issue) => issue.id === id);

  if (!issue) {
    throw new ApiError(404, `Issue with id ${id} not found`);
  }

  res.status(200).json(issue);
}

// POST /api/issues
// validateIssue middleware has already confirmed `title` exists
// by the time this runs.
function createIssue(req, res) {
  const { title, description = "", status = "open" } = req.body;

  const newIssue = {
    id: nextId++,
    title: title.trim(),
    description,
    status,
    category: null, // AI classifier fills this in later
    priority: null,
  };

  issues.push(newIssue);
  res.status(201).json(newIssue);
}

// PUT /api/issues/:id
function updateIssue(req, res) {
  const id = Number(req.params.id);
  const issue = issues.find((issue) => issue.id === id);

  if (!issue) {
    throw new ApiError(404, `Issue with id ${id} not found`);
  }

  const { title, description, status } = req.body;

  if (title !== undefined) issue.title = title.trim();
  if (description !== undefined) issue.description = description;
  if (status !== undefined) issue.status = status;

  res.status(200).json(issue);
}

// DELETE /api/issues/:id
function deleteIssue(req, res) {
  const id = Number(req.params.id);
  const index = issues.findIndex((issue) => issue.id === id);

  if (index === -1) {
    throw new ApiError(404, `Issue with id ${id} not found`);
  }

  const [deleted] = issues.splice(index, 1);
  res.status(200).json({ message: "Issue deleted", issue: deleted });
}

module.exports = {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
};
