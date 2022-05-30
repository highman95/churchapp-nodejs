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

exports.dailyAttendanceAnalysis = (req, res) => {
  executeDailyAttendanceAnalysis(req, res);
};

exports.dailyAttendanceAnalysisPage = (req, res) => {
  stationService.get(req?.user0?.organization_id, (_err, stations) => {
    executeDailyAttendanceAnalysis(req, res, { stations });
  });
};

exports.dailyExpenditureAnalysisPage = (req, res) => {
  const { user: user0 } = req;

  res.render("reports/expenditure-summary", {
    title: "Daily Expenditure Analysis",
    user0,
  });
};

exports.dailyIncomeAnalysis = (req, res) => {
  executeDailyIncomeAnalysis(req, res);
};

exports.dailyIncomeAnalysisPage = (req, res) => {
  stationService.get(req?.user0?.organization_id, (_err, stations) => {
    executeDailyIncomeAnalysis(req, res, { stations });
  });
};

exports.missionStationAnalysis = (req, res) => {
  executeMissionStationAnalysis(req, res);
};

exports.missionStationAnalysisPage = (req, res) => {
  stationService.get(req?.user?.organization_id, (_err, stations) => {
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

function executeDailyAttendanceAnalysis(req, res, { stations } = {}) {
  const {
    query: { station, monthYear },
    user: user0,
    isWR,
  } = req;

  reportService.dailyAttendanceSummary(
    station,
    monthYear,
    (err, records, code = 400) => {
      // if called from api
      if (!isWR) {
        return res.status(code).json({
          status: !err,
          data: records,
          message:
            err?.message ?? "Daily attendance statistics successfully fetched",
        });
      }

      const [year, month] = new Date().toISOString().split("T")[0].split("-");
      const maxMonthYear = `${year}-${month}`;

      res.render("reports/attendance-summary", {
        title: "Daily Attendance Analysis",
        user0,
        stations,
        queryRef: {
          current: monthYear ?? maxMonthYear,
          station,
          max: maxMonthYear,
        },
        records,
      });
    }
  );
}

function executeDailyIncomeAnalysis(req, res, { stations } = {}) {
  const {
    query: { station, monthYear },
    user: user0,
    isWR,
  } = req;

  reportService.dailyIncomeSummary(
    station,
    monthYear,
    (err, records, code = 400) => {
      // if called from api
      if (!isWR) {
        return res.status(code).json({
          status: !err,
          data: records,
          message:
            err?.message ?? "Daily income statistics successfully fetched",
        });
      }

      const [year, month] = new Date().toISOString().split("T")[0].split("-");
      const maxMonthYear = `${year}-${month}`;

      res.render("reports/income-summary", {
        title: "Daily Income Analysis",
        user0,
        stations,
        queryRef: {
          current: monthYear ?? maxMonthYear,
          station,
          max: maxMonthYear,
        },
        records,
      });
    }
  );
}

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

      res.render("reports/mission-station-summary", {
        title: "Mission Station Analysis",
        user0,
        stations,
        queryRef: {
          current: {
            from: fromMonthYear ?? maxMonthYear,
            to: toMonthYear ?? maxMonthYear,
          },
          station,
          max: maxMonthYear,
        },
        records,
        periodLength: records?.periods?.length ?? 0,
      });
    }
  );
}
