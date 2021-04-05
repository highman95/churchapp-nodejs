const userService = require("../services/user");

module.exports = {
  get: (req, res, next) => {
    try {
      //
    } catch (e) {
      next(e);
    }
  },

  create: (req, res, next) => {
    const { name } = req.body;
    try {
      //
      res.status(201).json({
        status: true,
        data: { name },
        message: "User successfully created",
      });
    } catch (e) {
      next(e);
    }
  },

  createPage: (req, res) => {},
};
