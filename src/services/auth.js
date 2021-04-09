const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userService = require("../services/user");

module.exports = {
  login: (username, password, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    userService.findByEmail(username, true, (err, user) => {
      if (err) {
        return callBack(err, null, 400);
      }

      if (!user) {
        return callBack(new Error("User cannot be found"), null, 404);
      }

      if (parseInt(user.active) === 0) {
        return callBack(new Error("Your account is inactive"), null, 400);
      }

      bcrypt.compare(password, user.password, (err, isCorrect) => {
        if (err || !isCorrect) {
          return callBack(new Error("Invalid username/password"), null, 400);
        }

        // generate JWT-token
        const token = jwt.sign({ data: username }, process.env.JWT_SECRET, {
          expiresIn: "24h",
          issuer: process.env.JWT_ISSUER,
        });

        // remove PIIs
        delete user.password;

        return callBack(null, {
          data: { ...user, active: user.active == 1 },
          token,
        });
      });
    });
  },
};
