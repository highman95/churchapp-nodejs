const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userService = require("./user");

module.exports = {
  find: userService.find, // alias for user-service logic

  login: (username, password, cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!password || !password.trim()) {
      return cb(new Error("Password is required"), null);
    }

    userService.findByEmail(username, true, (err, user, code = 400) => {
      if (err) {
        return cb(err, null, code);
      }

      if (parseInt(user.active) === 0) {
        return cb(new Error("Your account is inactive"), null);
      }

      if (user.attempts >= parseInt(process.env.LOGIN_TRIES)) {
        return userService.lock(username, (err0, _) => {
          return cb(new Error("Your account has been locked"), null);
        });
      }

      bcrypt.compare(password, user.password, (err, isCorrect) => {
        if (err || !isCorrect) {
          return userService.incrementTries(username, (err1, _) => {
            return cb(new Error("Invalid username / password"), null);
          });
        }

        if (parseInt(user.attempts) > 0) {
          userService.resetTries(username, (err2, _) => _);
        }

        // generate JWT-token
        const token = jwt.sign({ username }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
          issuer: process.env.JWT_ISSUER,
        });

        // make account stale (i.e. not fresh/first-time login user)
        if (parseInt(user.fresh) === 1) {
          userService.makeStale(username, (err3, _) => _);
        }

        // remove PIIs
        delete user.password;

        return cb(
          null,
          {
            data: { ...user, active: user.active == 1 },
            token,
          },
          200
        );
      });
    });
  },

  resetPassword: (username, oldPassword, newPassword, cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    userService.changePassword(
      username,
      oldPassword,
      newPassword,
      (err, user = null, code = 400) => {
        return err ? cb(err, null, code) : cb(null, user, 204);
      }
    );
  },
};
