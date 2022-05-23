const reportController = require("../../controllers/report");
const { authenticate } = require("../../utils/middlewares");

module.exports = (router) => {
  router.get(
    "/api/v1/reports/mission-station-analysis",
    authenticate,
    reportController.missionStationAnalysis
  );
};
