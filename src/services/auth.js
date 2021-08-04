const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userService = require("./user");

module.exports = {
  login: (username, password, cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    userService.findByEmail(username, true, (err, user) => {
      if (err) {
        return cb(err, null, 400);
      }

      if (!user) {
        return cb(new Error("User cannot be found"), null, 404);
      }

      if (parseInt(user.active) === 0) {
        return cb(new Error("Your account is inactive"), null, 400);
      }

      bcrypt.compare(password, user.password, (err, isCorrect) => {
        if (err || !isCorrect) {
          return cb(new Error("Invalid username/password"), null, 400);
        }

        // generate JWT-token
        const token = jwt.sign({ username }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
          issuer: process.env.JWT_ISSUER,
        });

        // remove PIIs
        delete user.password;

        return cb(null, {
          data: { ...user, active: user.active == 1 },
          token,
        });
      });
    });
  },
};
