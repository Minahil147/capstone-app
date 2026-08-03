const {
    getActiveUserNames,
    getNumberStats
} = require("./capstone-app/utils/dataUtils");

const users = [
    { name: "Ali", active: true },
    { name: "Ahmed", active: false },
    { name: "Sara", active: true },
    { name: "Zain", active: true }
];

console.log(getActiveUserNames(users));

console.log(getActiveUserNames([]));

console.log(getActiveUserNames(null));

console.log(getNumberStats([2, 4, 6, 8]));

console.log(getNumberStats([]));

console.log(getNumberStats([100]));


const express = require("express"); 
const router = express.Router(); 
const { 
  getAllIssues, getIssueById, createIssue, updateIssue, deleteIssue, 
} = require("../controllers/issueController"); 
router.get("/", getAllIssues); 
router.get("/:id", getIssueById); 
router.post("/", createIssue); 
router.put("/:id", updateIssue); 
router.delete("/:id", deleteIssue); 
module.exports = router; 