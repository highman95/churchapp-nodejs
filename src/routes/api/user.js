const userController = require("../../controllers/user");

module.exports = (router) => {
  router.get("/api/v1/users", userController.get);
  router.post("/api/v1/users", userController.create);
};
