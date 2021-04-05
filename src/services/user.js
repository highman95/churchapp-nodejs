module.exports = {
  get: (callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      "SELECT id, first_name, last_name, phone, email, active FROM users ORDER BY last_name",
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result);
      }
    );
  },

  create: (user) => {},

  find: (id, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      "SELECT first_name, last_name, phone, email, active FROM users WHERE id = ?",
      [id],
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result);
      }
    );
  },
};
