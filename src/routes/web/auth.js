const authController = require("../../controllers/auth");
const passportService = require("../../services/passport");

module.exports = (router) => {
  router
    .route("/login")
    .post(
      passportService.authenticate("local", {
        successReturnToOrRedirect: "/",
        failureRedirect: "/login",
      })
      // authController.login
    )
    .get(authController.loginView);

  router.route("/logout").get(authController.logout);
};
