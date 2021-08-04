const authService = require("../services/auth");

module.exports = {
  login: (req, res, next) => {
    try {
      const { username, password } = req.body;

      authService.login(username, password, (err, payload, code = 200) => {
        res.status(code).json({
          status: !err,
          ...payload,
          message: err ? err.message : null,
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
