const multer = require("multer");
const { verifyToken, TokenExpiredError } = require("./security");
const userService = require("../services/user");

// #region multer middleware
exports.upload = multer({
  dest: "uploads/",
  limits: { fileSize: 4 * 1024 * 1024 }, //4mb
});

// #region authentication middleware
exports.authenticate = (req, _, next) => {
  const { authorization = "" } = req.headers;
  const [, token] = authorization.split(" ");

  if (!token?.trim()) {
    next(new Error("Token is required"));
    return;
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (e) {
    next(
      new Error(
        `Token is ${e.name === TokenExpiredError.name ? "expired" : "invalid"}`
      )
    );
    return;
  }

  userService.findByEmail(payload.username, true, (err, user) => {
    // error-occurred || user === null
    if (err) {
      next(new Error("Token-user verification failed"));
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
      next(new Error("Token-user account inactive"));
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

exports.errorHandler = (err, _req, res, _next) => {
  let message = err.message || err.error.message;
  const messageLC = message?.toLowerCase() ?? "";

  const isBRE = err.name === ReferenceError.name; // bad-reference error
  const isTAE =
    messageLC.indexOf("token") >= 0 &&
    ["required", "invalid", "expired"].some((v) => messageLC.indexOf(v) >= 0);

  // client-side (input) error
  const isCSE = [EvalError.name, Error.name, RangeError.name].includes(
    err.name
  );

  let statusCode = isCSE ? 400 : 500;
  statusCode = isTAE ? 401 : statusCode;

  return res.status(err.code || (isBRE ? 404 : statusCode)).send({
    status: false,
    data: null,
    message,
  });
};
