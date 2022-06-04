const express = require("express");
const { signUp, signIn, getSubmissions } = require("./../controllers/user");

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.get('/:username/submissions', getSubmissions);

module.exports = router;
