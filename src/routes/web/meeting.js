const meetingController = require("../../controllers/meeting");

module.exports = (router) => {
  router.get("/meetings", meetingController.show);

  router
    .route("/meetings/add")
    .post(meetingController.create)
    .get(meetingController.createPage);

  router.get("/meetings/:id", meetingController.describe);
};
