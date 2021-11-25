const express = require("express");
const path = require("path");
const hbs = require("hbs");
const passportService = require("./services/passport");

const { routeType, errorHandler } = require("./utils/middlewares");
const routes = require("./routes");
global.db = require("./utils/db");

const app = express();

// enable cors, compression, helmet on api-routes
app.use(
  "/api/v1",
  require("cors")(),
  require("helmet")(),
  require("compression")(),
  (req, res, next) => {
    next();
  }
);

app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public"))); // configure express to use public folder

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

hbs.registerPartials(path.join(__dirname, "views/partials"), (err) => {});
hbs.registerHelper("computeSno", (index) => index + 1);
hbs.registerHelper("isTrue", (p0, p1) => p0 === p1);

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passportService.initialize());
app.use(passportService.session());

// define all routes and route-type
app.use(routeType, routes(express.Router()), errorHandler);

module.exports = app;
