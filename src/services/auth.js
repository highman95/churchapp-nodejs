const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userService = require("./user");

module.exports = {
  find: userService.find, // alias for user-service logic

  login(username, password, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!password || !password.trim()) {
      return cb(new Error("Password is required"), null);
    }

    userService.findByEmail(username, true, (err0, user0, code = 400) => {
      if (err0) {
        return cb(err0, null, code);
      }

      if (!user0.active) {
        return cb(new Error("Your account is inactive"), null);
      }

      if (user0.attempts >= parseInt(process.env.LOGIN_TRIES)) {
        return userService.lock(username, (_err0, _) => {
          return cb(new Error("Your account has been locked"), null);
        });
      }

      bcrypt.compare(password, user0.password, (err1, isCorrect) => {
        if (err1 || !isCorrect) {
          return userService.incrementTries(username, (_err1, _) => {
            return cb(new Error("Invalid username / password"), null);
          });
        }

        if (user0.attempts > 0) {
          userService.resetTries(username, (_err2, _) => _);
        }

        // generate JWT-token
        const token = jwt.sign({ username }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
          issuer: process.env.JWT_ISSUER,
        });

        // make account stale (i.e. not fresh/first-time login user)
        if (user0.fresh) {
          userService.makeStale(username, (_err3, _) => _);
        }

        // remove PIIs
        delete user0.password;

        return cb(null, { data: user0, token }, 200);
      });
    });
  },

  resetPassword(username, oldPassword, newPassword, cb) {
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
