const ApiError = require("../utils/ApiError");
function validateIssueCreate(req, res, next) {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return next(new ApiError(400, "A non-empty 'title' field is required"));
  }

  next();
}
function validateIssueUpdate(req, res, next) {
  const { title } = req.body;

  if (title !== undefined && title.trim() === "") {
    return next(new ApiError(400, "'title' cannot be empty if provided"));
  }

  next();
}

module.exports = { validateIssueCreate, validateIssueUpdate };
