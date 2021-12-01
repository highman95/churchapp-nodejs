const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const isEmail = (email) => {
  return (
    email &&
    /^([a-zA-Z0-9_\-]+)(\.)?([a-zA-Z0-9_\-]+)@([a-zA-Z]+)\.([a-zA-Z]{2,})$/.test(
      email
    )
  );
};

module.exports = {
  get: (cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      "SELECT lower(hex(id)) as id, first_name, last_name, phone, email, active FROM users ORDER BY last_name",
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
        delete user.password;

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

  verify(email, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    this.findByEmail(email, false, (err, user) => {
      if (err) {
        return cb(err);
      }

      db.query(
        `UPDATE users SET active = '1', verified = '1' WHERE email = ?`,
        [email],
        (err1, _) => {
          return err1
            ? cb(err1, null, 500)
            : cb(null, { ...user, active: user.active == 1 }, 204);
        }
      );
    });
  },

  toggle(email, isOn, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    this.findByEmail(email, false, (err0, user, code = 400) => {
      if (err0) {
        return cb(err0, null, code);
      }

      db.query(
        `UPDATE users SET active = ? WHERE email = ?`,
        [isOn ? "1" : "0", email],
        (err1, _) => {
          return err1
            ? cb(err1, null, 500)
            : cb(null, { ...user, active: user.active == 1 }, 204);
        }
      );
    });
  },

  changePassword(email, oldPassword, newPassword, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    this.findByEmail(email, false, (err, user) => {
      if (err) {
        return cb(err);
      }

      if (!oldPassword || !oldPassword.trim()) {
        return cb(new Error("Your previous password is required"));
      }

      if (!newPassword || !newPassword.trim()) {
        return cb(new Error("Your current password is required"));
      }

      if (oldPassword === newPassword) {
        return cb(new Error("Your previous password cannot be reused"));
      }

      if (parseInt(user.active) === 0) {
        return cb(new Error("Your account is inactive"), null, 406);
      }

      bcrypt.compare(oldPassword, user.password, (err0, isCorrect) => {
        if (err0 || !isCorrect) {
          return cb(new Error("Invalid username/password"));
        }

        bcrypt.hash(newPassword, 10, (err1, passwordHash) => {
          if (err1) {
            return cb(new Error("Password cannot be hashed"), null, 500);
          }

          // clean-up PII-information
          delete user.id;
          delete user.password;

          db.query(
            `UPDATE users SET password = ? WHERE email = ?`,
            [passwordHash, email],
            (err2, _) => {
              return err2
                ? cb(err2, null, 500)
                : cb(null, { ...user, active: user.active == 1 }, 204);
            }
          );
        });
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

    if (!isEmail(email)) {
      return cb(new Error("E-mail is not in valid format"), null);
    }

    db.query(
      `SELECT first_name, last_name, phone, email, active ${
        isAuth ? ", password, lower(hex(id)) as id" : ""
      } FROM users WHERE email = ? LIMIT 1`,
      [email.trim().toLowerCase()],
      (err, result, _fields) => {
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
