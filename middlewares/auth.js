const asyncHandler = require("express-async-handler");
const { throwError } = require("../utils/errorHandler");
const { verifyToken } = require("../utils/jwt");
const User = require("../models/user");

const auth = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decodedToken = verifyToken(token);
      req.user = await User.findById(decodedToken.userID).select("-password -submissions").exec();
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not Authorized");
    }
  }

  if (!token) {
    throwError(res, 401, "Token missing!");
  }
});

module.exports = auth;
