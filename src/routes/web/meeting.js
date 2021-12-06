const { ensureLoggedIn } = require("connect-ensure-login");
const meetingController = require("../../controllers/meeting");
const statisticController = require("../../controllers/statistic");

module.exports = (router) => {
  router.get("/meetings", ensureLoggedIn(), meetingController.show);

  router
    .route("/meetings/add")
    .post(ensureLoggedIn(), meetingController.create)
    .get(ensureLoggedIn(), meetingController.createPage);

  router
    .route("/meetings/edit/:id")
    .post(ensureLoggedIn(), meetingController.edit)
    .get(ensureLoggedIn(), meetingController.editPage);

  router.get("/meetings/:id", ensureLoggedIn(), meetingController.describe);

  router
    .route("/meetings/:id/stats")
    .post(ensureLoggedIn(), statisticController.create)
    .get(ensureLoggedIn(), statisticController.get);
};
