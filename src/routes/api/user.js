const userController = require("../../controllers/user");
const assignmentController = require("../../controllers/assignment");

module.exports = (router) => {
  router.get("/api/v1/users", userController.get);
  router.post("/api/v1/users", userController.create);

  router.get("/api/v1/users/:id/assignments", assignmentController.get);
  router.post("/api/v1/users/:id/assignments", assignmentController.create);
};
