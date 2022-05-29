const jwt = require("jsonwebtoken");

const generateToken = (userID) => {
  return jwt.sign({ userID }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
    generateToken,
    verifyToken
};
