const fallbackController = require("../../controllers/fallback");

/**
 * @param {import("express").Router} router
 */
module.exports = (router) => {
  router.get("/api/v1/ping", fallbackController.ping);
  router.use("/api/*", fallbackController.all);
};
