const userService = require("../services/user");

module.exports = {
  get: (req, res, next) => {
    try {
      userService.get((err, users, code = 400) => {
        res.status(code).json({
          status: !err,
          data: users,
          message: err ? err.message : "Users successfully fetched",
        });
      });
    } catch (e) {
      next(e);
    }
  },

  view: (req, res) => {
    userService.get((err, users) => {
      res.render("users", { title: "Users", users: err ? [] : users });
    });
  },

  create: (req, res, next) => {
    try {
      userService.create(req.body, (err, user, code = 400) => {
        res.status(code).json({
          status: !err,
          data: user,
          message: err ? err.message : "User successfully created",
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
