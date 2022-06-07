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

  const [usernameExists, emailExists] = await Promise.all([
    User.exists({ username: username }).exec(),
    User.exists({ email: email }).exec(),
  ]);

  if (usernameExists) {
    throwError(res, 409, "Username already exists!");
  }

  if (emailExists) {
    throwError(res, 409, "Email already exists!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username: username,
    password: hashedPassword,
    email: email,
    submissions: [],
  });

  res.status(200).json({
    username: user.username,
    email: user.email,
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
    token: generateToken(user._id),
  });
});

const getSubmissions = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username: username })
    .select("submissions")
    .exec();
  res.status(200).json(user.submissions);
});

module.exports = {
  signUp,
  signIn,
  getSubmissions,
};
