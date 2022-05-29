const reportService = require("../../src/services/report");

describe("Report Service Test", () => {
  describe("Daily Attendance Summary Test", () => {
    test("should return error message when undefined station-id", (done) => {
      reportService.dailyAttendanceSummary(undefined, undefined, (err, _) => {
        if (err) {
          expect(err.message).toBe("Station id is required");
          done();
        }
      });
    });

    test("should return error message when undefined month-year", (done) => {
      reportService.dailyAttendanceSummary(1, undefined, (err, _) => {
        if (err) {
          expect(err.message).toBe("Month/Year is required");
          done();
        }
      });
    });

    test("should return error message when invalid month-year", (done) => {
      reportService.dailyAttendanceSummary(1, "2022-F5", (err, _) => {
        if (err) {
          expect(err.message).toBe("Month/Year contains invalid data");
          done();
        }
      });
    });
  });

  describe("Daily Income Summary Test", () => {
    test("should return error message when undefined station-id", (done) => {
      reportService.dailyIncomeSummary(undefined, undefined, (err0, _) => {
        if (err0) {
          expect(err0.message).toBe("Station id is required");
          done();
        }
      });
    });

    test("should return error message when undefined month-year", (done) => {
      reportService.dailyIncomeSummary(1, undefined, (err0, _) => {
        if (err0) {
          expect(err0.message).toBe("Month/Year is required");
          done();
        }
      });
    });

    test("should return error message when invalid month-year", (done) => {
      reportService.dailyIncomeSummary(1, "2022-F5", (err0, _) => {
        if (err0) {
          expect(err0.message).toBe("Month/Year contains invalid data");
          done();
        }
      });
    });
  });

  describe("Mission-Station Summary Test", () => {
    test("should return error message when undefined station-id", (done) => {
      reportService.missionStationPeriodicSummary(
        undefined,
        undefined,
        undefined,
        (err0, _) => {
          expect(err0.message).toBe("Station id is required");
          done();
        }
      );
    });

    test("should return error message when period-range is undefined", (done) => {
      reportService.missionStationPeriodicSummary(
        1,
        undefined,
        undefined,
        (err0, _) => {
          expect(err0.message).toBe("Period range (month/year) is required");
          done();
        }
      );
    });

    test("should return error message when invalid period-range (from-month-year > to-month-year)", (done) => {
      reportService.missionStationPeriodicSummary(
        1,
        "2022-05",
        "2021-05",
        (err0, _) => {
          expect(err0.message).toBe("Period range is invalid");
          done();
        }
      );
    });
  });
});
