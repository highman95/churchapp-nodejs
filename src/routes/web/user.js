const { ensureLoggedIn } = require("connect-ensure-login");
const userController = require("../../controllers/user");

module.exports = (router) => {
  router
    .route("/users")
    .get(ensureLoggedIn(), userController.view)
    .post(ensureLoggedIn(), userController.create);

  router.route("/users/toggle").post(ensureLoggedIn(), userController.toggle);
};
