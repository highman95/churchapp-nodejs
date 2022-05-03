const userService = require("../services/user");

module.exports = {
  get: (_req, res, next) => {
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
      res.render("users", {
        title: "Users",
        user0: req.user,
        users: err ? [] : users,
      });
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

  verify: (req, res, next) => {
    try {
      const { username } = req.body;

      userService.verify(username, (err, data, code = 400) => {
        res.status(code).json({
          status: !err,
          data,
          message: err ? err.message : "User successfully verified",
        });
      });
    } catch (e) {
      next(e);
    }
  },

  toggle: (req, res, next) => {
    try {
      const { username, isOn = false } = req.body;

      userService.toggle(username, isOn, (err, data, code = 400) => {
        const prefix = isOn ? "" : "de-";

        res.status(code).json({
          status: !err,
          data,
          message: err ? err.message : `User successfully ${prefix}activated`,
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
