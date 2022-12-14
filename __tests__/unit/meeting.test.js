const meetingService = require("../../src/services/meeting");

describe("Meeting Service Unit-Test", () => {
  describe("Get Meetings Test", () => {
    test("should return error-message when organization-id is undefined", (done) => {
      meetingService.get(undefined, undefined, undefined, (err, _) => {
        expect(err?.message ?? undefined).toBe("Organization-id is required");
        done();
      });
    });
  });
});
