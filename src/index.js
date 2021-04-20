const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const express = require("express");
const path = require("path");
const hbs = require("hbs");

const { routeType, errorHandler } = require("./utils/middlewares");
const routes = require("./routes");
global.db = require("./utils/db");

const app = express();

// enable cors, compression, helmet on api-routes
app.use(
  "/api/v1",
  (req, res, next) => {
    next();
  },
  cors(),
  helmet(),
  compression()
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public"))); // configure express to use public folder

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views/partials"), (err) => {});

// define all routes and route-type
app.use(routeType, routes(express.Router()), errorHandler);

module.exports = app;
