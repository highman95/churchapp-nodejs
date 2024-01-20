const authService = require("../services/auth");
const passportService = require("../services/passport");

exports.login = (req, res, next) => {
  passportService.authenticate(
    "local",
    { session: req.isWR },
    (err, user, info, _status) => {
      if (err) return next(err);

      if (req.isWR) {
        if (!user) {
          if (info.message) {
            req.session.messages = [info.message];
          }

          return res.redirect("/login");
        }

        return req.login(user, (e) => {
          return e ? next(e) : res.redirect("/");
        });
      }

      res.status(info?.code).json({
        status: !info?.message,
        data: user ? { token: info.token, ...user } : null,
        message: info?.message,
      });
    }
  )(req, res, next);
};

exports.loginView = (_req, res) => {
  res.render("users/signin", { title: "Login" });
};

exports.logout = (req, res, next) => {
  if (req.isWR) {
    return req.logout((err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  }

  if (!req.user) return res.sendStatus(401);
};

exports.resetPassword = (req, res, next) => {
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
};
