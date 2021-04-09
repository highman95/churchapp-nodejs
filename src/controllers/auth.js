const authService = require("../services/auth");

module.exports = {
  login: (req, res, next) => {
    try {
      const { username, password } = req.body;

      authService.login(username, password, (err, payload, code = 200) => {
        if (err) {
          res.status(code).json({ status: false, message: err.message });
          return;
        }

        res.json({ status: true, ...payload });
      });
    } catch (e) {
      next(e);
    }
  },
};
