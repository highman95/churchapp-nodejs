const { ensureLoggedIn } = require("connect-ensure-login");
const fallbackController = require("../../controllers/fallback");

/**
 * @param {import("express").Router} router
 */
module.exports = (router) => {
  router.get("/", ensureLoggedIn(), fallbackController.home);
  router.use("*", ensureLoggedIn(), fallbackController.all);
};
