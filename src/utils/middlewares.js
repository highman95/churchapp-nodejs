const multer = require("multer");
const jwt = require("jsonwebtoken");
const userService = require("../services/user");

// #region multer middleware
exports.upload = multer({ dest: "uploads/" });

// #region authentication middleware
exports.authenticate = (req, _, next) => {
  const { authorization = "" } = req.headers;
  const [, token] = authorization.split(" ");

  if (!token || !token.trim()) {
    next(new Error("Token is required"));
    return;
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
      issuer: process.env.JWT_ISSUER,
    });
  } catch (e) {
    next(
      new Error(
        `Token is ${e.name === "TokenExpiredError" ? "expired" : "invalid"}`
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
  req.isWR = req.path && !req.path.startsWith("/api"); // is web-route
  next();
};

exports.errorHandler = (err, _req, _res, next) => {
  next(err);
};
