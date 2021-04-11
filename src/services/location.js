module.exports = {
  get: (callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query("SELECT id, name FROM locations ORDER BY name", (err, result) => {
      return err ? callBack(err, null) : callBack(null, result);
    });
  },

  create(location, callBack) {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!location || typeof location !== "object") {
      return callBack(new Error("Location-profile is required"), null, 406);
    }

    // extract parameters
    const { name } = location;

    this.findByName(name, (err0, namedLocation) => {
      if (err0) {
        return callBack(err0, null);
      }

      if (namedLocation) {
        return callBack(new Error("Name already used"), null, 409);
      }

      db.query(
        "INSERT INTO locations (name) VALUES (?)",
        [name.trim().toLowerCase()],
        (err, result) => {
          return err
            ? callBack(err, null, 500)
            : callBack(null, { id: result.insertId, ...location }, 201);
        }
      );
    });
  },

  findByName: (name, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!name || !name.trim()) {
      return callBack(new Error("Name is required"), null);
    }

    db.query(
      "SELECT id FROM locations WHERE name = ?",
      [name.trim().toLowerCase()],
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result[0]);
      }
    );
  },

  find: (id, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!id) {
      return callBack(new Error("Id is required"), null);
    }

    db.query("SELECT name FROM locations WHERE id = ?", [id], (err, result) => {
      return err ? callBack(err, null) : callBack(null, result[0]);
    });
  },
};
