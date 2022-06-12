const stationController = require("../../controllers/station");

module.exports = (router) => {
  router
    .route("/api/v1/stations")
    .get(stationController.get)
    .post(stationController.create);
};
