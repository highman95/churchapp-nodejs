const express = require("express");
const path = require("path");
const hbs = require("hbs");
const passportService = require("./services/passport");

const { routeType, errorHandler } = require("./utils/middlewares");
const {
  showPaginationLinks,
  formatDateToISO,
  formatToDateOnly,
  commafy,
  addSuffix,
  selected,
} = require("./utils/helpers");
const routes = require("./routes");
global.db = require("./utils/db");

const app = express();

// enable cors, compression, helmet on api-routes
app.use(routeType);
app.use(
  "/api/v1",
  require("cors")(),
  require("helmet")(),
  require("compression")(),
  (_req, _res, next) => {
    next();
  }
);

app.use(
  require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true, maxAge: 60000 },
  }),
  (req, res, next) => {
    if (req.isWR && req.session) {
      const msgs = req.session.messages || [];

      res.locals.messages = msgs;
      res.locals.hasMessages = !!msgs.length;
      req.session.messages = [];
    }

    next();
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public"))); // configure express to use public folder

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

hbs.registerPartials(path.join(__dirname, "views/partials"), (_) => _);
hbs.registerHelper(
  "computeSno",
  (index, index0) => index + 1 + (typeof index0 === "number" ? index0 : 0)
);
hbs.registerHelper("isTrue", (p0, p1) => p0 === p1);
hbs.registerHelper("addSuffix", addSuffix);
hbs.registerHelper("showPaginationLinks", showPaginationLinks);
hbs.registerHelper("formatDateToISO", formatDateToISO);
hbs.registerHelper("formatToDateOnly", formatToDateOnly);
hbs.registerHelper("commafy", commafy);
hbs.registerHelper("selected", selected);

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passportService.initialize(), passportService.session());

// define all routes and route-type
app.use(routes(express.Router()), errorHandler);

process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error --> ", err);
  process.exit(1);
});

module.exports = app;
