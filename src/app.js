require("dotenv").config();
const app = require("./index");

const server = app
  .listen(process.env.PORT || 3000, () => {
    console.log(`Listening on PORT: ${server.address().port}`);
  })
  .on("error", (error) => {
    console.error("Error-event occurred: ", error.message);
  });

module.exports = server;
