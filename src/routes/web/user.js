const { ensureLoggedIn } = require("connect-ensure-login");
const userController = require("../../controllers/user");

module.exports = (router) => {
  router.get("/users", ensureLoggedIn(), userController.view); // view-all/one; add; edit
};
