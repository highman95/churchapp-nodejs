const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  get: (cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      "SELECT hex(id) as id, first_name, last_name, phone, email, active FROM users ORDER BY last_name",
      (err, result) => {
        return err ? cb(err, null, 500) : cb(null, result, 200);
      }
    );
  },

  create(user, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!user || typeof user !== "object") {
      return cb(new Error("User-profile is required"), null, 406);
    }

    // extract parameters
    const { title, first_name, last_name, phone, email, password } = user;

    if (!title || !title.trim()) {
      return cb(new Error("Title is required"), null);
    }

    if (!first_name || !first_name.trim()) {
      return cb(new Error("First-name is required"), null);
    }

    if (!last_name || !last_name.trim()) {
      return cb(new Error("Last-name is required"), null);
    }

    if (!phone || !phone.trim()) {
      return cb(new Error("Phone is required"), null);
    }

    if (!password || !password.trim()) {
      return cb(new Error("Password is required"), null);
    }

    this.findByEmail(email, false, (err0, emailUser, code = 400) => {
      if (err0 && code !== 404) {
        return cb(err0, null, code);
      }

      if (emailUser) {
        return cb(new Error("E-mail already used"), null, 409);
      }

      bcrypt.hash(password, 10, (err1, passwordHash) => {
        if (err1) {
          return cb(new Error("Password cannot be hashed"), null, 500);
        }

        // re-format values
        const id = uuidv4(); // new-user-id
        const email_lc = email.trim().toLowerCase();

        db.query(
          `INSERT INTO users (id, title, first_name, last_name, phone, email, password) 
           VALUES (UNHEX(REPLACE(?,'-','')), ?, ?, ?, ?, ?, ?)`,
          [id, title, first_name, last_name, phone, email_lc, passwordHash],
          (err2, result) => {
            return err2
              ? cb(err2, null, 500)
              : cb(null, { id: id.replace("-", ""), ...user }, 201);
          }
        );
      });
    });
  },

  findByEmail: (email, isAuth, cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!email || !email.trim()) {
      return cb(new Error("E-mail is required"), null);
    }

    db.query(
      `SELECT first_name, last_name, phone, email, active ${
        isAuth ? ", password, hex(id) as id" : ""
      } FROM users WHERE email = ? LIMIT 1`,
      [email.trim().toLowerCase()],
      (err, result, fields) => {
        return err
          ? cb(err, null, 500)
          : result[0]
          ? cb(null, result[0], 200)
          : cb(new Error("User not found"), null, 404);
      }
    );
  },

  find: (id, cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!id || !id.trim()) {
      return cb(new Error("Id is required"), null);
    }

    db.query(
      "SELECT first_name, last_name, phone, email, active FROM users WHERE hex(id) = ?",
      [id],
      (err, result) => {
        return err
          ? cb(err, null, 500)
          : result[0]
          ? cb(null, result[0], 200)
          : cb(new Error("User not found"), null, 404);
      }
    );
  },
};
