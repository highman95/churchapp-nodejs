"use strict";

const { ensureCallBackIsDefined } = require("../utils/validation");

module.exports = {
  get: (cb) => {
    ensureCallBackIsDefined(cb);

    db.query(
      "SELECT id, name FROM meeting_types ORDER BY name",
      (err, result) => {
        return err ? cb(err, null) : cb(null, result);
      }
    );
  },
};
