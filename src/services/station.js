module.exports = {
  get: (cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query("SELECT id, name FROM stations ORDER BY name", (err, result) => {
      return err ? cb(err, null) : cb(null, result);
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
    const { name } = station;

    this.findByName(name, (err0, namedStation) => {
      if (err0) {
        return cb(err0, null);
      }

      if (namedStation) {
        return cb(new Error("Name already used"), null, 409);
      }

      db.query(
        "INSERT INTO stations (name) VALUES (?)",
        [name.trim().toLowerCase()],
        (err, result) => {
          return err
            ? cb(err, null, 500)
            : cb(null, { id: result.insertId, ...station }, 201);
        }
      );
    });
  },

  findByName: (name, cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!name || !name.trim()) {
      return cb(new Error("Name is required"), null);
    }

    db.query(
      "SELECT id FROM stations WHERE name = ?",
      [name.trim().toLowerCase()],
      (err, result) => {
        return err ? cb(err, null) : cb(null, result[0]);
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

    db.query("SELECT name FROM stations WHERE id = ?", [id], (err, result) => {
      return err ? cb(err, null) : cb(null, result[0]);
    });
  },
};
