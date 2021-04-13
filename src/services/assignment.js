module.exports = {
  create(assignment, callBack) {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!assignment || typeof assignment !== "object") {
      return callBack(new Error("Assignment-data is required"), null);
    }

    // extract parameters
    const { user_id, location_id } = assignment;

    this.find(user_id, location_id, (err0, lastAssignment) => {
      if (err0) {
        return callBack(err0, null, 500);
      }

      if (lastAssignment) {
        return callBack(new Error("Assignment already saved"), null, 409);
      }

      db.query(
        "INSERT INTO assignments SET user_id = UNHEX(?), location_id = ?",
        [user_id, location_id],
        (err, result) => {
          return err
            ? callBack(err, null, 500)
            : callBack(null, assignment, 201);
        }
      );
    });
  },

  find: (user_id, location_id, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!user_id) {
      return callBack(new Error("User-id is required"), null);
    }

    if (!location_id || isNaN(location_id)) {
      return callBack(new Error("Location-id is required"), null);
    }

    db.query(
      "SELECT serving FROM assignments WHERE hex(user_id) = ? AND location_id = ?",
      [user_id, location_id],
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result[0]);
      }
    );
  },
};
