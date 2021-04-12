const meetingController = require("../../controllers/meeting");
const statisticController = require("../../controllers/statistic");

module.exports = (router) => {
  router.get("/api/v1/meetings", meetingController.get);
  router.post("/api/v1/meetings", meetingController.create);

  router.get("/api/v1/meetings/:id", meetingController.find);
  router.post("/api/v1/meetings/:id", statisticController.create);

  router.put("/api/v1/meetings/:id/stats/:sid", statisticController.update);
};
