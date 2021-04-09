const authController = require("../../controllers/auth");

module.exports = (router) => {
  router.post("/api/v1/auth/login", authController.login);
};
