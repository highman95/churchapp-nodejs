const mysql = require("mysql");
const { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_URL, DB_USERNAME } = process.env;

const connection = mysql.createConnection(
  DB_URL
    ? DB_URL
    : {
        host: DB_HOST,
        user: DB_USERNAME,
        password: DB_PASSWORD,
        database: DB_DATABASE,
      }
);

connection.connect(
  {
    typeCast: function (field, next) {
      if (
        (field.type === "ENUM" && field.length === 1) ||
        (field.type === "STRING" && field.length === 3)
      ) {
        return field.string() === "1"; // 1 = true, 0 = false
      } else {
        return next();
      }
    },
    supportBigNumbers: true,
    // debug: process.env.DEBUG_MODE === "true",
    // connectTimeout: 50000,
    // ssl: { ca: fs.readFileSync(__dirname + "/mysql-ca.crt") },
  },
  function (err) {
    if (err) {
      console.error(`error connecting: \n${err.stack}`);
      return;
    }

    console.log(`database-connected @ thread-${connection.threadId}`);
  }
);

module.exports = connection;
