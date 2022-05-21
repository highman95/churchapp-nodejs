const { ensureLoggedIn } = require("connect-ensure-login");
const reportController = require("../../controllers/report");

module.exports = (router) => {
  router.get("/reports", ensureLoggedIn(), reportController.homePage);

  router.get(
    "/reports/income-analysis",
    ensureLoggedIn(),
    reportController.dailyIncomeAnalysisPage
  );
};
