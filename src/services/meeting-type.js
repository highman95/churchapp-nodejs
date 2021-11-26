module.exports = {
  get: (cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      "SELECT id, name FROM meeting_types ORDER BY name",
      (err, result) => {
        return err ? cb(err, null) : cb(null, result);
      }
    );
  },
};
