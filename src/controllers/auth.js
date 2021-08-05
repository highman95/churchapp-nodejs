const authService = require("../services/auth");

module.exports = {
  login: (req, res, next) => {
    try {
      const { username, password } = req.body;

      authService.login(username, password, (err, payload, code = 400) => {
        res.status(code).json({
          status: !err,
          data: payload,
          message: err ? err.message : null,
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
