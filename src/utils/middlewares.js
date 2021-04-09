const multer = require("multer");
const jwt = require("jsonwebtoken");
const userService = require("../services/user");

// #region multer middleware
const upload = multer({ dest: "uploads/" });

// #region authentication middleware
const auth = (req, res, next) => {
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

  userService.findByEmail(payload.data.username, true, (err, user) => {
    // error-occurred || user === null
    if (err || !user) {
      next(new Error("Token-user verification failed"));
      return;
    }

    const { first_name: firstName, last_name: lastName, email, active } = user;

    if (active === "0") {
      next(new Error("Token-user account inactive"));
      return;
    }

    req.auth = {
      user: { firstName, lastName, email },
    };
    next();
  });
};

const routeType = (req, res, next) => {
  req.isWR = req.path && !req.path.startsWith("/api"); // is web-route
  next();
};

const errorHandler = (err, req, res, next) => {
  // console.log(`error:\n${JSON.stringify(err, null, 2)}`);
  // next(e);
};

module.exports = {
  auth,
  routeType,
  upload,
  errorHandler,
};
