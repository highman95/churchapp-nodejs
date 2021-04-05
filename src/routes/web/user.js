const userController = require("../../controllers/user");

module.exports = (router) => {
  router.get("/users", userController.view); // view-all/one; add; edit
};
