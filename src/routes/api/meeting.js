const { check } = require("express-validator");
const meetingController = require("../../controllers/meeting");
const statisticController = require("../../controllers/statistic");
const { validateInput } = require("../../utils/middlewares");

module.exports = (router) => {
  router
    .route("/api/v1/meetings")
    .get(meetingController.get)
    .post(
      // https://medium.com/geekculture/build-and-deploy-a-web-application-with-react-and-node-js-express-bce2c3cfec32
      [
        check("tag", "Tag is required").notEmpty(),
        check("station_id", "Station-id is required").isInt(),
        check("meeting_type_id", "Meeting-Type-id is required").isInt(),
        check("held_on", "Meeting-date is required").isBefore(),
        validateInput,
      ],
      meetingController.create
    );

  router
    .route("/api/v1/meetings/:id")
    .get(meetingController.find)
    .post(statisticController.create);

  router
    .route("/api/v1/meetings/:id/stats/:sid")
    .put(statisticController.update);
};
