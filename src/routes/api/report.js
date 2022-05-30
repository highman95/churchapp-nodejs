const reportController = require("../../controllers/report");
const { authenticate } = require("../../utils/middlewares");

module.exports = (router) => {
  router.get(
    "/api/v1/reports/attendance-analysis",
    authenticate,
    reportController.dailyAttendanceAnalysis
  );

  router.get(
    "/api/v1/reports/income-analysis",
    authenticate,
    reportController.dailyIncomeAnalysis
  );

  router.get(
    "/api/v1/reports/mission-station-analysis",
    authenticate,
    reportController.missionStationAnalysis
  );
};
