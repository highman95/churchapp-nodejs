const stationController = require("../../controllers/station");

module.exports = (router) => {
  router.get("/api/v1/stations", stationController.get);
  router.post("/api/v1/stations", stationController.create);
};
