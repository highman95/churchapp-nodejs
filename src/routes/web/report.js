const { ensureLoggedIn } = require("connect-ensure-login");
const reportController = require("../../controllers/report");

module.exports = (router) => {
  router.get("/reports", ensureLoggedIn(), reportController.homePage);

  router.get(
    "/reports/attendance-analysis",
    ensureLoggedIn(),
    reportController.dailyAttendanceAnalysisPage
  );

  router.get(
    "/reports/expenditure-analysis",
    ensureLoggedIn(),
    reportController.dailyExpenditureAnalysisPage
  );

  router.get(
    "/reports/income-analysis",
    ensureLoggedIn(),
    reportController.dailyIncomeAnalysisPage
  );

  router.get(
    "/reports/mission-station-analysis",
    ensureLoggedIn(),
    reportController.missionStationAnalysisPage
  );

  router.get(
    "/reports/rof-control-analysis",
    ensureLoggedIn(),
    reportController.rofControlAnalysisPage
  );
};
