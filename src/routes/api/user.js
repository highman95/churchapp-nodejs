const userController = require("../../controllers/user");
const assignmentController = require("../../controllers/assignment");

module.exports = (router) => {
  router.get("/api/v1/users", userController.get);
  router.post("/api/v1/users", userController.create);

  router.post("/api/v1/users/assignments", assignmentController.create);
};
