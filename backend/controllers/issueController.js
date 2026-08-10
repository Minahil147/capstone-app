const Issue = require("../models/Issue");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const getAllIssues = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const issues = await Issue.find(filter);
  res.status(200).json(issues);
});

const getMyIssues = asyncHandler(async (req, res) => {
  const issues = await Issue.find({ createdBy: req.user.id });
  res.status(200).json(issues);
});

const getIssueById = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) throw new ApiError(404, `Issue with id ${req.params.id} not found`);
  res.status(200).json(issue);
});

const createIssue = asyncHandler(async (req, res) => {
  const { title, description = "", status = "open" } = req.body;
  const newIssue = await Issue.create({
    title: title.trim(),
    description,
    status,
    createdBy: req.user.id,
  });
  res.status(201).json(newIssue);
});

const updateIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) throw new ApiError(404, `Issue with id ${req.params.id} not found`);

  const isOwner = issue.createdBy.toString() === req.user.id;
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You can only edit issues you created");
  }

  const { title, description, status } = req.body;
  if (title !== undefined) issue.title = title.trim();
  if (description !== undefined) issue.description = description;
  if (status !== undefined) issue.status = status;

  await issue.save();
  res.status(200).json(issue);
});

const deleteIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) throw new ApiError(404, `Issue with id ${req.params.id} not found`);

  const isOwner = issue.createdBy.toString() === req.user.id;
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You can only delete issues you created");
  }

  await issue.deleteOne();
  res.status(200).json({ message: "Issue deleted", issue });
});

module.exports = { getAllIssues, getMyIssues, getIssueById, createIssue, updateIssue, deleteIssue };