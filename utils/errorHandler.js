const throwError = (res, statusCode, message) => {
  res.status(statusCode);
  throw new Error(message);
};

module.exports = {
  throwError,
};
