const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  get: (callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      "SELECT hex(id) as id, first_name, last_name, phone, email, active FROM users ORDER BY last_name",
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result);
      }
    );
  },

  create(user, callBack) {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!user || typeof user !== "object") {
      return callBack(new Error("User-details are required"), null);
    }

    const { title, first_name, last_name, phone, email, password } = user;

    if (!title || !title.trim()) {
      return callBack(new Error("Title is required"), null);
    }

    if (!first_name || !first_name.trim()) {
      return callBack(new Error("First-name is required"), null);
    }

    if (!last_name || !last_name.trim()) {
      return callBack(new Error("Last-name is required"), null);
    }

    if (!phone || !phone.trim()) {
      return callBack(new Error("Phone is required"), null);
    }

    if (!email || !email.trim()) {
      return callBack(new Error("E-mail is required"), null);
    }

    if (!password || !password.trim()) {
      return callBack(new Error("Password is required"), null);
    }

    this.findByEmail(email, false, (err0, emailUser) => {
      if (err0) {
        return callBack(err0, null);
      }

      if (emailUser) {
        return callBack(new Error("E-mail already used"), null);
      }

      bcrypt.hash(password, 10, (err1, passwordHash) => {
        if (err1) {
          return callBack(new Error("Password cannot be hashed"), null);
        }

        db.query(
          "INSERT INTO users (id, title, first_name, last_name, phone, email, password) VALUES (UNHEX(REPLACE(?,'-','')), ?, ?, ?, ?, ?, ?)",
          [uuidv4(), title, first_name, last_name, phone, email, passwordHash],
          (err2, result) => {
            return err2 ? callBack(err2, null) : callBack(null, result);
          }
        );
      });
    });
  },

  findByEmail: (email, isAuth, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!email || !email.trim()) {
      return callBack(new Error("E-mail is required"));
    }

    db.query(
      `SELECT first_name, last_name, phone, email, active ${
        isAuth ? ", password, hex(id) as id" : ""
      } FROM users WHERE email = ? LIMIT 1`,
      [email],
      (err, result, fields) => {
        return err ? callBack(err, null) : callBack(null, result[0]);
      }
    );
  },

  find: (id, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      "SELECT first_name, last_name, phone, email, active FROM users WHERE hex(id) = ?",
      [id],
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result[0]);
      }
    );
  },
};
