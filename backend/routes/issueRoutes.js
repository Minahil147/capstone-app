const express = require("express");
const router = express.Router();

const {
  getAllIssues, getMyIssues, getIssueById, createIssue, updateIssue, deleteIssue,
} = require("../controllers/issueController");
const { validateIssueCreate, validateIssueUpdate } = require("../middleware/validateIssue");
const { requireAuth } = require("../middleware/auth");

router.get("/", getAllIssues);
router.get("/mine", requireAuth, getMyIssues);
router.get("/:id", getIssueById);
router.post("/", requireAuth, validateIssueCreate, createIssue);
router.put("/:id", requireAuth, validateIssueUpdate, updateIssue);
router.delete("/:id", requireAuth, deleteIssue);

module.exports = router;