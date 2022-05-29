const http = require("http");
const { startServer, stopServer, responseHandler } = require("../utils");

describe("Report Integration-Test Suite", () => {
  const routePath = "/api/v1/reports";

  let host;
  let options = {};

  beforeAll(() => {
    ({ host, options } = startServer());
  });

  afterAll((done) => stopServer(() => done()));

  describe("GET /reports/mission-station-analysis", () => {
    let endPoint;

    beforeAll(() => {
      endPoint = `${host}${routePath}/mission-station-analysis`;
    });

    describe("Station-id is undefined", () => {
      let responseBox = {};

      beforeAll((done) => {
        http.get(
          endPoint,
          options,
          responseHandler((data) => {
            responseBox = data;
            done();
          })
        );
      });

      it("should return statusCode 400", () => {
        expect(responseBox.response.statusCode).toBe(400);
      });

      it("should return error status", () => {
        expect(responseBox.body.status).toBe(false);
      });

      it("should return null as data", () => {
        expect(responseBox.body.data).toBeNull();
      });

      it("should return error message [Station id is required]", () => {
        expect(responseBox.body.message).toBe("Station id is required");
      });
    });

    describe("Period range (month/year) is undefined", () => {
      let responseBox = {};

      beforeAll((done) => {
        http.get(
          `${endPoint}?station=1&fromMonthYear=&toMonthYear=`,
          options,
          responseHandler((data) => {
            responseBox = data;
            done();
          })
        );
      });

      it("should return statusCode 400", () => {
        expect(responseBox.response.statusCode).toBe(400);
      });

      it("should return error status", () => {
        expect(responseBox.body.status).toBe(false);
      });

      it("should return null as data", () => {
        expect(responseBox.body.data).toBeNull();
      });

      it("should return error message [Period range (month/year) is required]", () => {
        expect(responseBox.body.message).toBe(
          "Period range (month/year) is required"
        );
      });
    });

    describe("Period range (month/year) is invalid", () => {
      let responseBox = {};

      beforeAll((done) => {
        http.get(
          `${endPoint}?station=1&fromMonthYear=2022-05&toMonthYear=2021-05`,
          options,
          responseHandler((data) => {
            responseBox = data;
            done();
          })
        );
      });

      it("should return statusCode 406", () => {
        expect(responseBox.response.statusCode).toBe(406);
      });

      it("should return false as status", () => {
        expect(responseBox.body.status).toBeFalsy();
      });

      it("should return null as data", () => {
        expect(responseBox.body.data).toBeNull();
      });

      it("should return error message [Period range is invalid]", () => {
        expect(responseBox.body.message).toBe("Period range is invalid");
      });
    });
  });
});
