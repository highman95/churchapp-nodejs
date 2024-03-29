module.exports = {
  get: (cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      "SELECT * FROM audits ORDER BY created_at DESC",
      (err, results) => {
        return err ? cb(err, null, 500) : cb(null, results, 200);
      }
    );
  },

  create: (audit, cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!audit || typeof audit !== "object") {
      return cb(new Error("Audit-Data is required"), null, 406);
    }

    // extract parameters
    const { action, actor, url, data, organization_id } = audit;

    if (!action || !action.trim()) {
      return cb(new Error("Action-Name is required"), null);
    }

    if (!actor || !actor.trim()) {
      return cb(new Error("Actor-Name is required"), null);
    }

    if (!url || !url.trim()) {
      return cb(new Error("Url is required"), null);
    }

    db.query(
      "INSERT INTO audits (action, actor, url, data, organization_id) VALUES (?, ?, ?, ?, ?)",
      [action.trim().toLowerCase(), actor, url, data, organization_id],
      (err, result) => {
        return err
          ? cb(new Error("Audit cannot be saved"), null, 500)
          : cb(null, { id: result.insertId, ...audit }, 201);
      }
    );
  },

  find: (organization_id, id, cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    // because organization_id can be null
    if (organization_id && isNaN(organization_id)) {
      return cb(new Error("Organization-Id is required"), null);
    }

    if (!id || isNaN(id)) {
      return cb(new Error("Audit-Id is required"), null);
    }

    db.query(
      "SELECT action, actor, url, data FROM audits WHERE id = ?",
      [id],
      (err, results) => {
        return err
          ? cb(err, null, 500)
          : results[0]
          ? cb(null, results[0], 200)
          : cb(new Error("Audit not found"), null, 404);
      }
    );
  },

  ping: () => {
    db.ping((err) => {
      if (err) throw err;
      console.log("Server responded to ping");
    });
  },
};
