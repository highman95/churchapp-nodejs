const meetingController = require("../../controllers/meeting");

module.exports = (router) => {
  router.get("/api/v1/meetings", meetingController.get);
  router.post("/api/v1/meetings", meetingController.create);

  router.get("/api/v1/meetings/:id", meetingController.find);
  router.post("/api/v1/meetings/:id", meetingController.addStat);
};
