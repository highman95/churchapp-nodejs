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
      const newUser = req.body;

      userService.create(newUser, (err, result) => {
        if (err) {
          res.status(400).json({
            status: false,
            message: err.message,
          });
          return;
        }

        // may never occur
        if (result && !(result.insertId || result.affectedRows)) {
          res.status(500).json({
            status: false,
            message: "Unknown error occurred",
          });
          return;
        }

        res.status(201).json({
          status: true,
          data: newUser,
          message: "User successfully created",
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
