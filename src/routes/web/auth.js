const { ensureLoggedIn } = require("connect-ensure-login");
const authController = require("../../controllers/auth");
const passportService = require("../../services/passport");

module.exports = (router) => {
  router
    .route("/login")
    .post(
      passportService.authenticate("local", {
        successReturnToOrRedirect: "/",
        // successRedirect: "/",
        failureRedirect: "/login",
        // failureFlash: true,
        failureMessage: true,
      })
      // authController.login
    )
    .get(authController.loginView);

  router.route("/logout").get(ensureLoggedIn(), authController.logout);
};
