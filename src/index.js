require("dotenv").config();

const cors = require("cors");
const compression = require("compression");
const express = require("express");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 3000, (err) => {
  console.log(
    err
      ? `Error: ${err}...`
      : `app started successfully...${server.address().port}`
  );
});
