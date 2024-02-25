const { ensureLoggedIn } = require("connect-ensure-login");
const { check } = require("express-validator");
const meetingController = require("../../controllers/meeting");
const statisticController = require("../../controllers/statistic");
const { validateInput } = require("../../utils/middlewares");

module.exports = (router) => {
  router
    .route("/meetings")
    .get(ensureLoggedIn(), meetingController.getPage)
    .post(
      ensureLoggedIn(),
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
    .route("/meetings/edit/:id")
    .post(ensureLoggedIn(), meetingController.edit)
    .get(ensureLoggedIn(), meetingController.editPage);

  router.get("/meetings/:id", ensureLoggedIn(), meetingController.describe);

  router
    .route("/meetings/:id/stats")
    .post(ensureLoggedIn(), statisticController.create)
    .get(ensureLoggedIn(), statisticController.get);

  router
    .route("/meetings/:id/stats/edit/:sid")
    .post(ensureLoggedIn(), statisticController.update);
};
