const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { generateToken } = require("./../utils/jwt");
const { throwError } = require("../utils/errorHandler");
const User = require("../models/user");

/**
 * @api {post} /user/signup User signup
 * @apiName signUp
 * @apiGroup User
 *
 * @apiBody {String} username sername of the User.
 * @apiBody {String} email  email of the User.
 * @apiBody {String} password  password of the User.
 *
 * @apiSuccess {String} username Username of the User.
 * @apiSuccess {String} email  Email of the User.
 * @apiSuccess {String} token  JWT token for User authentication.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "username": "random_user",
 *       "email": "random_user@examplemail.com",
 *       "token" : "example_token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzNDU2Nzg5LCJuYW1lIjoiSm9zZXBoIn0.OpOSSw7e485LOP5PrzScxHb7SR6sAOMRckfFwi4rp7o"
 *     }
 *
 * @apiError SingUpError Username/email/password is missing or User already exists with username/email.
 */
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

/**
 * @api {post} /user/signin User signin
 * @apiName signIn
 * @apiGroup User
 *
 * @apiBody {String} email  email of the User.
 * @apiBody {String} password  password of the User.
 *
 * @apiSuccess {String} username Username of the User.
 * @apiSuccess {String} email  Email of the User.
 * @apiSuccess {String} token  JWT token for User authentication.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "username": "random_user",
 *       "email": "random_user@examplemail.com",
 *       "token" : "example_token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzNDU2Nzg5LCJuYW1lIjoiSm9zZXBoIn0.OpOSSw7e485LOP5PrzScxHb7SR6sAOMRckfFwi4rp7o"
 *     }
 *
 * @apiError SingInError Email/password is missing or User doesn't exists with email or Password is invalid.
 */
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

/**
 * @api {get} /user/:username/submissions Get user submissions.
 * @apiName getSubmissions
 * @apiGroup User
 *
 * @apiParam {String} username username of the User.
 *
 * @apiSuccess {String} porblemID Problem's id for which submission was made.
 * @apiSuccess {String} problemTitle  Title of the problem.
 * @apiSuccess {String} languageName  Language used to submit the solution.
 * @apiSuccess {Object} status  Submission status.
 * @apiSuccess {Number} status.id Submission status id.
 * @apiSuccess {String} status.description Submission status description.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "problemID": "example_id",
 *       "problemTitle": "Find the array element",
 *       "languageName" : "CPP",
 *       "status": {
 *          "id": 3,
 *          "description": "Accepted"
 *       }
 *     }
 *
 * @apiError SingInError Email/password is missing or User doesn't exists with email or Password is invalid.
 */
const getSubmissions = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username: username })
    .select("submissions").sort({ createdAt: 'desc'}).exec();
  res.status(200).json(user.submissions);
});

module.exports = {
  signUp,
  signIn,
  getSubmissions,
};
