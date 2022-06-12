const { ensureLoggedIn } = require("connect-ensure-login");
const meetingController = require("../../controllers/meeting");
const statisticController = require("../../controllers/statistic");

module.exports = (router) => {
  router
    .route("/meetings")
    .get(ensureLoggedIn(), meetingController.show)
    .post(ensureLoggedIn(), meetingController.create);

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
