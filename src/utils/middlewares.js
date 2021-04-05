const multer = require("multer");

const upload = multer({ dest: "uploads/" });

const auth = (req, res, next) => {
  next();
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
