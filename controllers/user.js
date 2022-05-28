const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { generateToken } = require("./../utils/jwt");
const { throwError } = require("../utils/errorHandler");
const User = require("../models/user");

const signUp = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throwError(res, 400, "Missing Credentials");
  }

  if (await User.exists({ username: username }).exec()) {
    throwError(res, 409, "Username already exists!");
  }

  if (await User.exists({ email: email }).exec()) {
    throwError(res, 409, "Email already exists!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username: username,
    password: hashedPassword,
    email: email,
    problems: [],
  });

  res.status(200).json({
    username: user.username,
    email: user.email,
    problems: user.problems,
    token: generateToken(user._id),
  });
});

const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throwError(res, 400, "Missing Credentials");
  }

  const user = await User.findOne({ email: email }).exec();
  if (!user) {
    throwError(res, 404, "User doesn't exists!");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throwError(res, 400, "Invalid password!");
  }

  res.status(200).json({
    username: user.username,
    email: user.email,
    problems: user.problems,
    token: generateToken(user._id),
  });
});

module.exports = {
  signUp,
  signIn,
};
