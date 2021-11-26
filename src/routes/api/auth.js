const authController = require("../../controllers/auth");

module.exports = (router) => {
  router.post("/api/v1/auth/login", authController.login);
  router.patch("/api/v1/auth/password/reset", authController.resetPassword);
};
