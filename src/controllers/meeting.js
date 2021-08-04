const meetingService = require("../services/meeting");
const stationService = require("../services/station");
const meetingTypeService = require("../services/meeting-type");

module.exports = {
  get: (req, res, next) => {
    try {
      meetingService.get((err, meetings) => {
        res.status(err ? 400 : 200).json({
          status: !err,
          data: meetings,
          message: err ? err.message : "Meetings successfully fetched",
        });
      });
    } catch (e) {
      next(e);
    }
  },

  show: (req, res) => {
    const {
      query: { err: error },
    } = req;

    try {
      meetingService.get((err, meetings) => {
        res.render("meetings", { title: "Meetings", meetings, error });
      });
    } catch (e) {}
  },

  create: (req, res, next) => {
    try {
      meetingService.create(req.body, (err, meeting, code = 400) => {
        if (err) {
          return req.isWR
            ? res.redirect(`/meetings?err=${err.message}`)
            : res.status(code).json({ status: false, message: err.message });
        }

        return req.isWR
          ? res.redirect(`/meetings/${meeting.id}`)
          : res.status(code).json({
              status: true,
              data: meeting,
              message: "Meeting successfully saved",
            });
      });
    } catch (e) {
      next(e);
    }
  },

  createPage: (req, res) => {
    try {
      stationService.get((err0, stations) => {
        meetingTypeService.get((err1, meetingTypes) => {
          var now = new Date();
          now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // local-datetime

          res.render("meetings/add", {
            title: "Meetings",
            stations,
            meetingTypes,
            currentDateTime: now.toISOString().slice(0, 16),
          });
        });
      });
    } catch (e) {}
  },

  find: (req, res, next) => {
    try {
      meetingService.find(req.params.id, (err, meeting, code = 400) => {
        res.status(code).json({
          status: !err,
          data: meeting,
          message: err ? err.message : "Meeting successfully found",
        });
      });
    } catch (e) {
      next(e);
    }
  },

  edit: (req, res, next) => {
    try {
      meetingService.edit(
        req.params.id,
        req.body,
        (err, meeting, code = 400) => {
          return req.isWR
            ? res.redirect(
                `/meetings/${err ? "edit/" : ""}${meeting.id}?err=${
                  err ? err.message : ""
                }`
              )
            : res.status(code).json({
                status: !!err,
                data: meeting,
                message: err ? err.message : "Meeting successfully updated",
              });
        }
      );
    } catch (e) {
      next(e);
    }
  },

  editPage: (req, res) => {
    try {
      meetingService.find(req.params.id, (err, meeting) => {
        res.render("meetings/edit", {
          title: "Meetings",
          meeting: { ...meeting, id: req.params.id },
        });
      });
    } catch (e) {}
  },

  describe: (req, res) => {
    try {
      meetingService.find(req.params.id, (err, meeting) => {
        if (meeting) {
          var held_on = new Date(meeting.held_on);
          held_on.setMinutes(
            held_on.getMinutes() - held_on.getTimezoneOffset()
          ); // local-datetime

          const s_cnt = meeting.statistics.length + 1;
          meeting = { ...meeting, held_on, id: req.params.id, s_cnt };
        }

        return !!meeting
          ? res.render("meetings/view", { title: "Meetings", meeting })
          : res.redirect("/meetings");
      });
    } catch (e) {}
  },
};
