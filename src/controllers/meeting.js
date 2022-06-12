const meetingService = require("../services/meeting");
const stationService = require("../services/station");
const meetingTypeService = require("../services/meeting-type");

const defaultPage = 1;
const defaultSize = process.env.PAGINATION_CHUNK_SIZE;

module.exports = {
  get: (req, res, next) => {
    const {
      query: { page = defaultPage, size = defaultSize },
      user: { organization_id },
    } = req;

    try {
      meetingService.get(
        organization_id,
        page,
        size,
        (err, meetings, code = 400) => {
          const { data = [], count = 0 } = meetings ?? {};

          res.status(code).json({
            status: !err,
            data,
            count,
            currentPage: page,
            message: err ? err.message : "Meetings successfully fetched",
          });
        }
      );
    } catch (e) {
      next(e);
    }
  },

  show: (req, res) => {
    const {
      query: { page = defaultPage, size = defaultSize, err: error },
      user: user0,
    } = req;

    try {
      stationService.get(user0.organization_id, (_err0, stations) => {
        meetingTypeService.get((_err1, meetingTypes) => {
          meetingService.get(
            user0.organization_id,
            page,
            size,
            (_err, meetings) => {
              const { data = [], count = 0 } = meetings ?? {};

              var now = new Date();
              now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // local-datetime

              res.render("meetings", {
                title: "Meetings",
                user0,
                meetings: data,
                count,
                currentPage: page,
                stations,
                meetingTypes,
                currentDateTime: now.toISOString().slice(0, 16),
                error,
              });
            }
          );
        });
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
    const {
      params: { id },
      body,
      user: { organization_id },
      isWR,
    } = req;

    try {
      meetingService.edit(
        organization_id,
        id,
        body,
        (err, meeting, code = 400) => {
          const redirectUri = err ? "edit/" : "";
          let message = err ? err.message : undefined;
          message = !message && isWR ? "" : "Meeting successfully updated";

          return isWR
            ? res.redirect(
                `/meetings/${redirectUri}${meeting.id}?err=${message}`
              )
            : res.status(code).json({
                status: !err,
                data: meeting,
                message,
              });
        }
      );
    } catch (e) {
      next(e);
    }
  },

  editPage: (req, res) => {
    const {
      params: { id },
      user: user0,
    } = req;

    try {
      stationService.get(user0.organization_id, (_err0, stations) => {
        meetingTypeService.get((_err1, meetingTypes) => {
          meetingService.find(user0.organization_id, id, (_err, meeting) => {
            res.render("meetings/edit", {
              title: "Meetings",
              user0,
              stations,
              meetingTypes,
              meeting: { ...meeting, id },
            });
          });
        });
      });
    } catch (e) {}
  },

  describe: (req, res) => {
    const {
      params: { id },
      user: user0,
    } = req;

    try {
      meetingService.find(user0.organization_id, id, (_err, meeting) => {
        if (meeting) {
          var held_on = new Date(meeting.held_on);
          held_on.setMinutes(
            held_on.getMinutes() - held_on.getTimezoneOffset()
          ); // local-datetime

          const s_cnt = meeting.statistics.length + 1;
          meeting = { ...meeting, held_on, id, s_cnt };
        }

        return !!meeting
          ? res.render("meetings/detail", {
              title: "Meetings",
              user0,
              meeting,
            })
          : res.redirect("/meetings");
      });
    } catch (e) {}
  },
};
