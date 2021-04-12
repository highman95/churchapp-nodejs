const meetingService = require("../services/meeting");

module.exports = {
  get: (req, res, next) => {
    try {
      meetingService.get((err, meetings) => {
        if (err) {
          res.status(400).json({ status: false, message: err.message });
          return;
        }

        res.json({
          status: true,
          data: meetings,
          message: "Meetings successfully fetched",
        });
      });
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
      meetingService.create(req.body, (err, meeting, code = 400) => {
        if (err) {
          res.status(code).json({ status: false, message: err.message });
          return;
        }

        res.status(code).json({
          status: true,
          data: meeting,
          message: "Meeting successfully saved",
        });
      });
    } catch (e) {
      next(e);
    }
  },

  createPage: (req, res) => {},

  find: (req, res, next) => {
    try {
      meetingService.find(req.params.id, (err, meeting, code = 400) => {
        if (err) {
          res.status(code).json({ status: false, message: err.message });
          return;
        }

        res.json({
          status: true,
          data: meeting,
          message: "Meeting successfully found",
        });
      });
    } catch (e) {
      next(e);
    }
  },

  describe: (req, res) => {
    try {
      //
      res.render("", { meeting: {} });
    } catch (e) {}
  },
};
