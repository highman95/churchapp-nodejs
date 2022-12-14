const statisticService = require("../../src/services/statistic");

describe("Statistic Service Unit-Test", () => {
  describe("Get Statistics Test", () => {
    test("should return error-message when meeting-id is undefined", (done) => {
      statisticService.get(undefined, (err, _) => {
        expect(err?.message ?? undefined).toBe("Meeting-id is required");
        done();
      });
    });
  });
});
