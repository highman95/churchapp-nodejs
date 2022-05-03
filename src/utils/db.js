const mysql = require("mysql");
const ConnectionConfig = require("mysql/lib/ConnectionConfig");

const { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_URL, DB_USERNAME } = process.env;
const { host, user, password, database } = DB_URL
  ? ConnectionConfig.parseUrl(DB_URL)
  : {};

const connection = mysql.createConnection({
  host: host ?? DB_HOST,
  user: user ?? DB_USERNAME,
  password: password ?? DB_PASSWORD,
  database: database ?? DB_DATABASE,
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

connection.connect((err) => {
  if (err) {
    console.error(`error connecting: \n${err.stack}`);
    return;
  }

  console.log(`database-connected @ thread-${connection.threadId}`);
});

module.exports = connection;
