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
  stationService.get(req?.user?.organization_id, (_err, stations) => {
    executeDailyAttendanceAnalysis(req, res, { stations });
  });
};

exports.dailyExpenditureAnalysisPage = (req, res) => {
  stationService.get(req?.user?.organization_id, (_err, stations) => {
    executeDailyExpenditureAnalysis(req, res, { stations });
  });
};

exports.dailyIncomeAnalysis = (req, res) => {
  executeDailyIncomeAnalysis(req, res);
};

exports.dailyIncomeAnalysisPage = (req, res) => {
  stationService.get(req?.user?.organization_id, (_err, stations) => {
    executeDailyIncomeAnalysis(req, res, { stations });
  });
};

exports.dailyMinistersAnalysisPage = (req, res) => {
  stationService.get(req?.user?.organization_id, (_err, stations) => {
    executeDailyMinistersAnalysis(req, res, { stations });
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
  stationService.get(req?.user?.organization_id, (_err, stations) => {
    executeROFControlAnalysis(req, res, { stations });
  });
};

exports.wsfMeetingAnalysisPage = (req, res) => {
  stationService.get(req?.user?.organization_id, (_err, stations) => {
    executeWSFMeetingAnalysis(req, res, { stations });
  });
};

exports.weeklyServiceAnalysisPage = (req, res) => {
  stationService.get(req?.user?.organization_id, (_err, stations) => {
    executeWeeklyServiceAnalysis(req, res, { stations });
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
    (err, records = { data: [], meta: {} }, code = 400) => {
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
        title: "Reports",
        subTitle: "Daily Attendance Analysis",
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
    (err, records = { data: [], meta: {} }, code = 400) => {
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
        title: "Reports",
        subTitle: "Daily Income Analysis",
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

function executeDailyMinistersAnalysis(req, res, { stations } = {}) {
  const {
    query: { station, monthYear },
    user: user0,
    isWR,
  } = req;

  reportService.dailyMinistersSummary(
    station,
    monthYear,
    (err, records = { data: [], meta: {} }, code = 400) => {
      // if called from api
      if (!isWR) {
        return res.status(code).json({
          status: !err,
          data: records,
          message:
            err?.message ?? "Daily ministers' statistics successfully fetched",
        });
      }

      const [year, month] = new Date().toISOString().split("T")[0].split("-");
      const maxMonthYear = `${year}-${month}`;

      res.render("reports/ministers-summary", {
        title: "Reports",
        subTitle: "Daily Ministers Analysis",
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

function executeDailyExpenditureAnalysis(req, res, { stations } = {}) {
  const {
    query: { station, monthYear },
    user: user0,
    isWR,
  } = req;

  reportService.dailyExpenditureSummary(
    station,
    monthYear,
    (err, records = { data: [], meta: {} }, code = 400) => {
      if (!isWR) {
        return res.status(code).json({
          status: !err,
          data: records,
          message: err?.message ?? "Daily expenditure successfully fetched",
        });
      }

      const [year, month] = new Date().toISOString().split("T")[0].split("-");
      const maxMonthYear = `${year}-${month}`;

      res.render("reports/expenditure-summary", {
        title: "Reports",
        subTitle: "Daily Expenditure Analysis",
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
    (err, records = {}, code = 400) => {
      // if called from api
      if (!isWR) {
        delete records?.periods;

        return res.status(code).json({
          status: !err,
          data: records,
          message: err?.message ?? "Station statistics successfully fetched",
        });
      }

      const [year, month] = new Date().toISOString().split("T")[0].split("-");
      const maxMonthYear = `${year}-${month}`;

      res.render("reports/mission-station-summary", {
        title: "Reports",
        subTitle: "Mission Station Analysis",
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

function executeROFControlAnalysis(req, res, { stations } = {}) {
  const {
    query: { station, monthYear },
    user: user0,
    isWR,
  } = req;

  reportService.ROFControlSummary(
    station,
    monthYear,
    (err, records = { data: [], meta: {} }, code = 400) => {
      if (!isWR) {
        return res.status(code).json({
          status: !err,
          data: records,
          message: err?.message ?? "ROF control summary successfully fetched",
        });
      }

      const [year, month] = new Date().toISOString().split("T")[0].split("-");
      const maxMonthYear = `${year}-${month}`;

      res.render("reports/rof-control-summary", {
        title: "Reports",
        subTitle: "ROF Control Analysis",
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

function executeWSFMeetingAnalysis(req, res, { stations } = {}) {
  const {
    query: { station, monthYear },
    user: user0,
    isWR,
  } = req;

  reportService.wsfMeetingSummary(
    station,
    monthYear,
    (err, records = { data: [], meta: {} }, code = 400) => {
      // if called from api
      if (!isWR) {
        return res.status(code).json({
          status: !err,
          data: records,
          message:
            err?.message ?? "WSF meeting statistics successfully fetched",
        });
      }

      const [year, month] = new Date().toISOString().split("T")[0].split("-");
      const maxMonthYear = `${year}-${month}`;

      res.render("reports/wsf-meeting-summary", {
        title: "Reports",
        subTitle: "WSF Meeting Analysis",
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

function executeWeeklyServiceAnalysis(req, res, { stations } = {}) {
  const {
    query: { station, monthYear },
    user: user0,
    isWR,
  } = req;

  reportService.weeklyServiceSummary(
    station,
    monthYear,
    (err, records = { data: [], meta: {} }, code = 400) => {
      // if called from api
      if (!isWR) {
        return res.status(code).json({
          status: !err,
          data: records,
          message:
            err?.message ?? "Weekly service statistics successfully fetched",
        });
      }

      const [year, month] = new Date().toISOString().split("T")[0].split("-");
      const maxMonthYear = `${year}-${month}`;

      res.render("reports/weekly-service-summary", {
        title: "Reports",
        subTitle: "Weekly Service Analysis",
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
