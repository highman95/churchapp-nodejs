const multer = require("multer");
const { verifyToken, TokenExpiredError } = require("./security");
const userService = require("../services/user");
const { validationResult } = require("express-validator");

// #region multer middleware
exports.upload = multer({
  dest: "uploads/",
  limits: { fileSize: 4 * 1024 * 1024 }, //4mb
});

exports.validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      data: null,
      message: errors.array()[0].msg,
    });
  }

  next();
};

// #region authentication middleware
exports.authenticate = (req, _, next) => {
  const { authorization = "" } = req.headers;
  const [, token] = authorization.split(" ");

  let error = new Error("Token is required");
  error.status = 401;

  if (!token?.trim()) {
    next(error);
    return;
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (e) {
    const gist = e.name === TokenExpiredError.name ? "expired" : "invalid";
    error.message = `Token is ${gist}`;
    next(error);
    return;
  }

  userService.findByEmail(payload.username, true, (err, user) => {
    // error-occurred || user === null
    if (err) {
      error.message = "User verification failed";
      next(error);
      return;
    }

    const {
      first_name: firstName,
      last_name: lastName,
      email,
      active,
      organization_id,
    } = user;

    if (active === "0") {
      error.message = "User account is inactive";
      next(error);
      return;
    }

    req.user = { firstName, lastName, email, organization_id };
    next();
  });
};

exports.routeType = (req, _, next) => {
  req.isWR =
    req.path &&
    !req.path.startsWith("/api") &&
    !req.path.startsWith("/graphql"); // is web-route
  next();
};

exports.errorHandler = (err, req, res, _next) => {
  const message = err.message || err.error.message;
  const isBRE = err.name === ReferenceError.name; // bad-reference error

  // client-side (input) error
  const isCSE = [EvalError.name, Error.name, RangeError.name].includes(
    err.name
  );

  const statusCode = (err.code || err.status) ?? (isCSE ? 400 : 500);

  if (req.isWR) {
    return res.render("error", { title: "Error", error: err });
  }

  return res.status(isBRE ? 404 : statusCode).send({
    status: false,
    data: null,
    message,
  });
};
