const { ensureLoggedIn } = require("connect-ensure-login");
const authController = require("../../controllers/auth");

module.exports = (router) => {
  router
    .route("/login")
    .post(authController.login)
    .get(authController.loginView);

  router.route("/logout").get(ensureLoggedIn(), authController.logout);
};
