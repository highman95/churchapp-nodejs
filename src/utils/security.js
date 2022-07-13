const { sign, verify, TokenExpiredError } = require("jsonwebtoken");

const options = {
  expiresIn: process.env.JWT_EXPIRY,
  issuer: process.env.JWT_ISSUER,
  // subject: process.env.JWT_SUBJECT,
};

exports.generateToken = (user) => {
  return sign({ username: user.email }, process.env.JWT_SECRET, options);
};

exports.verifyToken = (token) => {
  return verify(token, process.env.JWT_SECRET, options);
};

exports.TokenExpiredError = TokenExpiredError;
