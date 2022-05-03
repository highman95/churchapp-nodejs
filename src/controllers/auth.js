const authService = require("../services/auth");

module.exports = {
  login: (req, res, next) => {
    try {
      const { username, password } = req.body;

      authService.login(username, password, (err, payload, code = 400) => {
        res.status(code).json({
          status: !err,
          data: payload?.data
            ? { token: payload.token, ...payload.data }
            : payload,
          message: err ? err.message : null,
        });
      });
    } catch (e) {
      next(e);
    }
  },

  loginView: (_req, res) => {
    res.render("users/signin", { title: "Login" });
  },

  logout: (req, res) => {
    if (req.isWR) {
      req.logout();
      res.redirect("/");
    }
  },

  resetPassword: (req, res, next) => {
    try {
      const { username, oldPassword, newPassword } = req.body;

      authService.resetPassword(
        username,
        oldPassword,
        newPassword,
        (err, data, code = 400) => {
          res.status(code).json({
            status: !err,
            data,
            message: err ? err.message : null,
          });
        }
      );
    } catch (e) {
      next(e);
    }
  },
};
