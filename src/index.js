require("dotenv").config();

// const cors = require("cors");
// const helmet = require("helmet");
// const compression = require("compression");
const express = require("express");
const path = require("path");
const hbs = require("hbs");

const { routeType, errorHandler } = require("./utils/middlewares");
const routes = require("./routes");

const connection = require("./utils/db");
global.db = connection;

const app = express();

// app.use(cors(), helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public"))); // configure express to use public folder

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views/partials"), (err) => {});

// define all routes and route-type
app.use(routeType, routes(express.Router()), errorHandler);

const server = app.listen(process.env.PORT || 3000, (err) => {
  console.log(
    err
      ? `Error: ${err}...`
      : `app started successfully...${server.address().port}`
  );
});
