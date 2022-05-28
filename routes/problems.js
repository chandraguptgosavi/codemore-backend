const express = require("express");
const {
  getAllProblems,
  getProblem,
  updateProblem,
  createProblem,
  runCode,
  submitProblem,
} = require("../controllers/problems");
const authMiddlware = require("../middlewares/auth");
const router = express.Router();

router.route("/").get(getAllProblems).post(authMiddlware, createProblem);
router.route("/:id").get(getProblem).put(authMiddlware, updateProblem);
router.put("/:id/submit", authMiddlware, submitProblem);
router.post("/run", authMiddlware, runCode);

module.exports = router;
