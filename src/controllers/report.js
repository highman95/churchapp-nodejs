const reportService = require("../services/report");
const stationService = require("../services/station");

exports.homePage = (req, res) => {
  const { path, user: user0 } = req;

  res.render("reports", {
    title: "Reports",
    routePath: path,
    user0,
  });
};

exports.dailyExpenditureAnalysisPage = (req, res) => {
  const { user: user0 } = req;

  res.render("reports/expenditure-summary", {
    title: "Daily Expenditure Analysis",
    user0,
  });
};

exports.dailyIncomeAnalysisPage = (req, res) => {
  const {
    user: user0,
    query: { station, monthYear },
  } = req;

  stationService.get(user0.organization_id, (_err0, stations) => {
    const [year, month] = new Date().toISOString().split("T")[0].split("-");
    const maxMonthYear = `${year}-${month}`;
    var currentMonthYear = monthYear ?? maxMonthYear;

    reportService.dailyIncomeSummary(station, monthYear, (_err1, records) => {
      res.render("reports/income-summary", {
        title: "Daily Income Analysis",
        user0,
        stations,
        queryRef: {
          current: currentMonthYear,
          station,
          max: maxMonthYear,
        },
        records,
      });
    });
  });
};

exports.missionStationAnalysisPage = (req, res) => {
  const { user: user0 } = req;

  res.render("reports/mission-station-summary", {
    title: "Mission Station Analysis",
    user0,
  });
};

exports.rofControlAnalysisPage = (req, res) => {
  const { user: user0 } = req;

  res.render("reports/rof-control-summary", {
    title: "ROF Control Analysis",
    user0,
  });
};
