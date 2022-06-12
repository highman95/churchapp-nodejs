const meetingController = require("../../controllers/meeting");
const statisticController = require("../../controllers/statistic");

module.exports = (router) => {
  router
    .route("/api/v1/meetings")
    .get(meetingController.get)
    .post(meetingController.create);

  router
    .route("/api/v1/meetings/:id")
    .get(meetingController.find)
    .post(statisticController.create);

  router
    .route("/api/v1/meetings/:id/stats/:sid")
    .put(statisticController.update);
};
