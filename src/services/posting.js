const { findResultHandler } = require("./common");
const modelName = "Posting";

module.exports = {
  create(posting, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!posting || typeof posting !== "object") {
      return cb(new Error("Posting-data is required"), null);
    }

    // extract parameters
    const { user_id, station_id, posted_at } = posting;

    this.find(user_id, station_id, (err0, lastPosting, code = 400) => {
      if (err0 && code !== 404) {
        return cb(err0, null, code);
      }

      if (lastPosting) {
        return cb(new Error("Posting already saved"), null, 409);
      }

      db.query(
        "INSERT INTO postings SET user_id = UNHEX(?), station_id = ?, posted_at = ?",
        [user_id, station_id, posted_at],
        (err, _) => {
          return err ? cb(err, null, 500) : cb(null, posting, 201);
        }
      );
    });
  },

  get(user_id, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!user_id) {
      return cb(new Error("User-id is required"), null);
    }

    db.query(
      `SELECT station_id, serving, posted_at FROM postings WHERE hex(user_id) = ?`,
      [user_id],
      (err, result) => {
        return err ? cb(err, null, 500) : cb(null, result, 200);
      }
    );
  },

  find(user_id, station_id, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!user_id) {
      return cb(new Error("User-id is required"), null);
    }

    if (!station_id || isNaN(station_id)) {
      return cb(new Error("Station-id is required"), null);
    }

    db.query(
      "SELECT serving, posted_at FROM postings WHERE hex(user_id) = ? AND station_id = ?",
      [user_id, station_id],
      findResultHandler(modelName, cb)
    );
  },
};
