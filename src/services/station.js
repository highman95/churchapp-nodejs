"use strict";

const { ensureCallBackIsDefined } = require("../utils/validation");
const { findResultHandler } = require("./common");
const modelName = "Station";

module.exports = {
  get(organization_id, cb) {
    ensureCallBackIsDefined(cb);

    if (!organization_id || isNaN(organization_id)) {
      return cb(new Error("Organization-Id is required"), null);
    }

    db.query(
      "SELECT id, name FROM stations WHERE organization_id = ? ORDER BY name",
      [organization_id],
      (err, result) => {
        return err ? cb(err, null, 500) : cb(null, result, 200);
      }
    );
  },

  create(station, cb) {
    ensureCallBackIsDefined(cb);

    if (!station || typeof station !== "object") {
      return cb(new Error("Station-profile is required"), null, 406);
    }

    // extract parameters
    const { organization_id, name } = station;

    this.findByName(organization_id, name, (err0, namedStation, code = 400) => {
      if (err0 && code !== 404) {
        return cb(err0, null, code);
      }

      if (namedStation) {
        return cb(new Error("Name already used"), null, 409);
      }

      db.query(
        "INSERT INTO stations (organization_id, name) VALUES (?, ?)",
        [organization_id, name.trim().toLowerCase()],
        (err, result) => {
          return err
            ? cb(err, null, 500)
            : cb(null, { id: result.insertId, ...station }, 201);
        }
      );
    });
  },

  findByName(organization_id, name, cb) {
    ensureCallBackIsDefined(cb);

    if (!organization_id || isNaN(organization_id)) {
      return cb(new Error("Organization-Id is required"), null);
    }

    if (!name?.trim()) {
      return cb(new Error("Name is required"), null);
    }

    db.query(
      "SELECT id FROM stations WHERE organization_id = ? AND name = ?",
      [organization_id, name.trim().toLowerCase()],
      findResultHandler(modelName, cb)
    );
  },

  find(id, cb) {
    ensureCallBackIsDefined(cb);

    if (!id) {
      return cb(new Error("Id is required"), null);
    }

    db.query(
      "SELECT organization_id, name FROM stations WHERE id = ?",
      [id],
      findResultHandler(modelName, cb)
    );
  },
};
