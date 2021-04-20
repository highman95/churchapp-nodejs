module.exports = {
  get: (callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      "SELECT id, name FROM meeting_types ORDER BY name",
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result);
      }
    );
  },
};
