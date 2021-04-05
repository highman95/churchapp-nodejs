module.exports = {
  get: (callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query("SELECT id, name FROM locations ORDER BY name", (err, result) => {
      return err ? callBack(err, null) : callBack(null, result);
    });
  },

  create: (name, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    // TODO: do some validation
    if (!name || !name.trim()) {
      return callBack(new Error("Name is required"), null);
    }

    db.query(
      "INSERT INTO locations (name) VALUES (?)",
      [name],
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result);
      }
    );
  },

  findByName: (name) => {
    return db.query(
      "SELECT id FROM locations WHERE name = ?",
      [name],
      (err, result) => {
        if (err) throw Error(err.message);
        return result;
      }
    );
  },

  find: (id, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query("SELECT name FROM locations WHERE id = ?", [id], (err, result) => {
      return err ? callBack(err, null) : callBack(null, result);
    });
  },
};
