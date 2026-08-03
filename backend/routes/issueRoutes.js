const express = require("express");
const router = express.Router();

const {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
} = require("../controllers/issueController");

const { validateIssueCreate, validateIssueUpdate } = require("../middleware/validateIssue");

router.get("/", getAllIssues);
router.get("/:id", getIssueById);
router.post("/", validateIssueCreate, createIssue);
router.put("/:id", validateIssueUpdate, updateIssue);
router.delete("/:id", deleteIssue);

module.exports = router;
