const meetingService = require("../services/meeting");

module.exports = {
  get: (req, res, next) => {
    try {
      //
    } catch (e) {
      next(e);
    }
  },

  show: (req, res) => {
    try {
      //
      res.render("meetings", { title: "Meetings", meetings: {} });
    } catch (e) {}
  },

  create: (req, res, next) => {
    try {
      //
    } catch (e) {
      next(e);
    }
  },

  createPage: (req, res) => {},

  describe: (req, res) => {
    try {
      //
      res.render("", { meeting: {} });
    } catch (e) {}
  },
};
