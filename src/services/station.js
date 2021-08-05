module.exports = {
  get: (cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query("SELECT id, name FROM stations ORDER BY name", (err, result) => {
      return err ? cb(err, null, 500) : cb(null, result, 200);
    });
  },

  create(station, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

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

  findByName: (organization_id, name, cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!organization_id || isNaN(organization_id)) {
      return cb(new Error("Organization-Id is required"), null);
    }

    if (!name || !name.trim()) {
      return cb(new Error("Name is required"), null);
    }

    db.query(
      "SELECT id FROM stations WHERE organization_id = ? AND name = ?",
      [organization_id, name.trim().toLowerCase()],
      (err, result) => {
        return err
          ? cb(err, null, 500)
          : result[0]
          ? cb(null, result[0], 200)
          : cb(new Error("Station not found"), null, 404);
      }
    );
  },

  find: (id, cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!id) {
      return cb(new Error("Id is required"), null);
    }

    db.query(
      "SELECT organization_id, name FROM stations WHERE id = ?",
      [id],
      (err, result) => {
        return err
          ? cb(err, null, 500)
          : result[0]
          ? cb(null, result[0], 200)
          : cb(new Error("Station not found"), null, 404);
      }
    );
  },
};
