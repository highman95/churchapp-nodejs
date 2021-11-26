const userController = require("../../controllers/user");
const postingController = require("../../controllers/posting");

module.exports = (router) => {
  router.get("/api/v1/users", userController.get);
  router.post("/api/v1/users", userController.create);

  router.put("/api/v1/users/verify", userController.verify);
  router.put("/api/v1/users/toggle", userController.toggle);

  router.get("/api/v1/users/:id/postings", postingController.get);
  router.post("/api/v1/users/:id/postings", postingController.create);
};
