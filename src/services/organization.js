module.exports = {
  get: (cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      "SELECT id, name FROM organizations ORDER BY name",
      (err, result) => {
        return err ? cb(err, null, 500) : cb(null, result, 200);
      }
    );
  },

  create(organization, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!organization || typeof organization !== "object") {
      return cb(new Error("Organization-profile is required"), null, 406);
    }

    // extract parameters
    const { name, founded_on } = organization;

    if (!founded_on || !new Date(founded_on).getTime()) {
      return cb(new Error("Founded-on is required as date"), null);
    }

    this.findByName(name, (err0, organization0, code = 400) => {
      if (err0 && code !== 404) {
        return cb(err0, null, code);
      }

      if (organization0) {
        return cb(new Error("Name already used"), null, 409);
      }

      db.query(
        "INSERT INTO organizations (name, founded_on) VALUES (?)",
        [name.trim().toLowerCase(), founded_on],
        (err, result) => {
          return err
            ? cb(err, null, 500)
            : cb(null, { id: result.insertId, ...organization }, 201);
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
      "SELECT id, founded_on, created_at FROM organizations WHERE name = ?",
      [name.trim().toLowerCase()],
      (err, result) => {
        return err
          ? cb(err, null, 500)
          : result[0]
          ? cb(null, result[0], 200)
          : cb(new Error("Organization not found"), null, 404);
      }
    );
  },

  find: (id, cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!id || isNaN(id)) {
      return cb(new Error("Organization-id is required"), null);
    }

    db.query(
      "SELECT name, founded_on, created_at FROM organizations WHERE id = ?",
      [id],
      (err, result) => {
        return err
          ? cb(err, null, 500)
          : result[0]
          ? cb(null, result[0], 200)
          : cb(new Error("Organization not found"), null, 404);
      }
    );
  },
};
