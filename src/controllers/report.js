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

exports.dailyAttendanceAnalysisPage = (req, res) => {
  const {
    user: user0,
    query: { station, monthYear },
  } = req;

  stationService.get(user0.organization_id, (_err0, stations) => {
    const [year, month] = new Date().toISOString().split("T")[0].split("-");
    const maxMonthYear = `${year}-${month}`;
    var currentMonthYear = monthYear ?? maxMonthYear;

    reportService.dailyAttendanceSummary(
      station,
      monthYear,
      (_err1, records) => {
        res.render("reports/attendance-summary", {
          title: "Daily Attendance Analysis",
          user0,
          stations,
          queryRef: {
            current: currentMonthYear,
            station,
            max: maxMonthYear,
          },
          records,
        });
      }
    );
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

exports.missionStationAnalysis = (req, res) => {
  executeMissionStationAnalysis(req, res);
};

exports.missionStationAnalysisPage = (req, res) => {
  stationService.get(req?.user?.organization_id, (_err0, stations) => {
    executeMissionStationAnalysis(req, res, { stations });
  });
};

exports.rofControlAnalysisPage = (req, res) => {
  const { user: user0 } = req;

  res.render("reports/rof-control-summary", {
    title: "ROF Control Analysis",
    user0,
  });
};

function executeMissionStationAnalysis(req, res, { stations } = {}) {
  const {
    query: { station, fromMonthYear, toMonthYear },
    user: user0,
    isWR,
  } = req;

  reportService.missionStationPeriodicSummary(
    station,
    fromMonthYear,
    toMonthYear,
    (err, records, code = 400) => {
      // if called from api
      if (!isWR) {
        delete (records ?? {}).periods;

        return res.status(code).json({
          status: !err,
          data: records,
          message: err?.message ?? "Station statistics successfully fetched",
        });
      }

      const [year, month] = new Date().toISOString().split("T")[0].split("-");
      const maxMonthYear = `${year}-${month}`;

      const currentFromMonthYear = fromMonthYear ?? maxMonthYear;
      const currentToMonthYear = toMonthYear ?? maxMonthYear;

      res.render("reports/mission-station-summary", {
        title: "Mission Station Analysis",
        user0,
        stations,
        queryRef: {
          current: { from: currentFromMonthYear, to: currentToMonthYear },
          station,
          max: maxMonthYear,
        },
        records,
        periodLength: records?.periods.length ?? 0,
      });
    }
  );
}
