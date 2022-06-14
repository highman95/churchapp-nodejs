const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { computePaginationParameters } = require("../utils/helpers");
const { findResultHandler } = require("./common");
const modelName = "User";

const isEmail = (email) => {
  return (
    email &&
    /^([a-zA-Z0-9_\-]+)(\.)?([a-zA-Z0-9_\-]+)@([a-zA-Z]+)\.([a-zA-Z]{2,})$/.test(
      email
    )
  );
};

exports.get = function (page, size, cb) {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }

  const { limit, offset } = computePaginationParameters(page, size);

  const sql = "SELECT {expectations} FROM users ORDER BY last_name";
  db.query(
    `${sql.replace("{expectations}", "COUNT(id) as count")}`,
    (err0, users) => {
      if (err0) {
        return cb(new Error("All users could not fetched"), null, 500);
      }

      const count = users[0]?.count ?? 0;
      if (count === 0) {
        return cb(null, { data: [], count }, 200);
      }

      db.query(
        `${sql.replace(
          "{expectations}",
          "lower(hex(id)) as id, title, first_name, last_name, phone, email, active"
        )} LIMIT ${offset}, ${limit}`,
        (err, usersInPage) => {
          return err
            ? cb(new Error("Users cannot be fetched"), null, 500)
            : cb(null, { data: usersInPage, count }, 200);
        }
      );
    }
  );
};

exports.create = function (user, cb) {
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

  findByEmail(email, false, onCheckedNonExistenceComputePasswordHash(user, cb));
};

exports.verify = function (email, cb) {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }

  findByEmail(email, false, (err, user) => {
    if (err) {
      return cb(err);
    }

    db.query(
      `UPDATE users SET active = '1', verified = '1' WHERE email = ?`,
      [email],
      (err1, _) => {
        return err1 ? cb(err1, null, 500) : cb(null, user, 204);
      }
    );
  });
};

exports.toggle = function (email, cb) {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }

  findByEmail(email, false, (err0, user, code = 400) => {
    if (err0) {
      return cb(err0, null, code);
    }

    user.active = !user.active; // flip the value
    db.query(
      `UPDATE users SET active = ? WHERE email = ?`,
      [user.active ? "1" : "0", email],
      (err1, _) => {
        return err1 ? cb(err1, null, 500) : cb(null, user, 204);
      }
    );
  });
};

exports.changePassword = function (email, oldPassword, newPassword, cb) {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
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

  findByEmail(
    email,
    false,
    onCheckedExistenceValidateOldPassword(email, oldPassword, newPassword, cb)
  );
};

function onCheckedNonExistenceComputePasswordHash(user, cb) {
  return (err0, user0, code = 400) => {
    if (err0 && code !== 404) {
      return cb(err0, null, code);
    }

    if (user0) {
      return cb(new Error("E-mail already used"), null, 409);
    }

    bcrypt.hash(user.password, 10, onHashedPasswordCreateUser());
  };

  function onHashedPasswordCreateUser() {
    return (err1, passwordHash) => {
      if (err1) {
        return cb(new Error("Password cannot be hashed"), null, 500);
      }

      // extract parameters
      const { title, first_name, last_name, phone, email } = user;

      // re-format values
      const id = uuidv4(); // new-user-id
      const email_lc = email.trim().toLowerCase();

      db.query(
        `INSERT INTO users (id, title, first_name, last_name, phone, email, password)
         VALUES (UNHEX(REPLACE(?,'-','')), ?, ?, ?, ?, ?, ?)`,
        [id, title, first_name, last_name, phone, email_lc, passwordHash],
        (err2, _) => {
          delete user.password;

          return err2
            ? cb(err2, null, 500)
            : cb(null, { id: id.replace("-", ""), ...user }, 201);
        }
      );
    };
  }
}

function onCheckedExistenceValidateOldPassword(
  email,
  oldPassword,
  newPassword,
  cb
) {
  return (err, user) => {
    if (err) {
      return cb(err);
    }

    if (!user.active) {
      return cb(new Error("Your account is inactive"), null, 406);
    }

    bcrypt.compare(oldPassword, user.password, (err0, isCorrect) => {
      if (err0 || !isCorrect) {
        return cb(new Error("Invalid username/password"));
      }

      bcrypt.hash(newPassword, 10, onHashedPasswordUpdateUser(user));
    });
  };

  function onHashedPasswordUpdateUser(user) {
    return (err1, passwordHash) => {
      if (err1) {
        return cb(new Error("Password cannot be hashed"), null, 500);
      }

      // clean-up PII-information
      delete user.id;
      delete user.password;

      db.query(
        "UPDATE users SET password = ?, locked = '0' WHERE email = ?",
        [passwordHash, email],
        (err2, _) => {
          return err2 ? cb(err2, null, 500) : cb(null, user, 204);
        }
      );
    };
  }
}

exports.incrementTries = function (email, cb) {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }

  db.query(
    "UPDATE users SET attempts = attempts + 1 WHERE email = ?",
    [email],
    (err, _) => {
      return err ? cb(err, 500) : cb(null, 204);
    }
  );
};

exports.resetTries = function (email, cb) {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }

  db.query(
    "UPDATE users SET attempts = 0 WHERE email = ?",
    [email],
    (err, _) => {
      return err ? cb(err, 500) : cb(null, 204);
    }
  );
};

exports.lock = function (email, cb) {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }

  db.query(
    "UPDATE users SET locked = '1' WHERE email = ?",
    [email],
    (err, _) => {
      return err ? cb(err, 500) : cb(null, 204);
    }
  );
};

exports.unlock = function (email, cb) {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }

  db.query(
    "UPDATE users SET locked = '0' WHERE email = ?",
    [email],
    (err, _) => {
      return err ? cb(err, 500) : cb(null, 204);
    }
  );
};

exports.makeStale = function (email, cb) {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }

  db.query(
    "UPDATE users SET fresh = '0' WHERE email = ?",
    [email],
    (err, _) => {
      return err ? cb(err, 500) : cb(null, 204);
    }
  );
};

function findByEmail(email, isAuth, cb) {
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
    `SELECT title, first_name, last_name, phone, email, active, 1 as organization_id ${
      isAuth ? ", password, fresh, attempts, locked, lower(hex(id)) as id" : ""
    } FROM users WHERE email = ? LIMIT 1`,
    [email.trim().toLowerCase()],
    findResultHandler(modelName, cb)
  );
}
exports.findByEmail = findByEmail;

exports.find = function (id, cb) {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }

  if (!id || !id.trim()) {
    return cb(new Error("Id is required"), null);
  }

  db.query(
    `SELECT title, first_name, last_name, phone, email, active, 1 as organization_id
     FROM users WHERE hex(id) = ?`,
    [id],
    findResultHandler(modelName, cb)
  );
};
