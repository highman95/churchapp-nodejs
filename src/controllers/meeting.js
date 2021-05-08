const meetingService = require("../services/meeting");
const locationService = require("../services/location");
const meetingTypeService = require("../services/meeting-type");

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
      meetingService.get((err, meetings) => {
        res.render("meetings", { title: "Meetings", meetings });
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
      locationService.get((err0, locations) => {
        meetingTypeService.get((err1, meetingTypes) => {
          var now = new Date();
          now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // local-datetime

          res.render("meetings/add", {
            title: "Meetings",
            locations,
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
          meeting = { ...meeting, held_on, id: req.params.id };
        }

        return !!meeting
          ? res.render("meetings/view", { title: "Meetings", meeting })
          : res.redirect("/meetings");
      });
    } catch (e) {}
  },
};
