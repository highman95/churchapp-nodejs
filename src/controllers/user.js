const userService = require("../services/user");

module.exports = {
  get: (req, res, next) => {
    try {
      userService.get((err, users) => {
        if (err) {
          res.status(400).json({
            status: false,
            message: err.message,
          });
          return;
        }

        res.json({
          status: true,
          data: users,
          message: "Users successfully fetched",
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
        if (err) {
          res.status(code).json({
            status: false,
            message: err.message,
          });
          return;
        }

        res.status(code).json({
          status: true,
          data: user,
          message: "User successfully created",
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
