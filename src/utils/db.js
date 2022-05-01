const mysql = require("mysql");

// const connection = mysql.createConnection(process.env.DB_URL);
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
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
});

connection.connect(function (err) {
  if (err) {
    console.error(`error connecting: \n${err.stack}`);
    return;
  }

  console.log(`database-connected @ thread-${connection.threadId}`);
});

module.exports = connection;
