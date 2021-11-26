const statisticService = require("./statistic");

module.exports = {
  get: (cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      `SELECT m.id, tag, held_on, mt.name meeting_type, s.name station FROM meetings m
      LEFT JOIN meeting_types mt ON mt.id = m.meeting_type_id
      LEFT JOIN stations s ON s.id = m.station_id ORDER BY held_on`,
      (err, result) => {
        return err ? cb(err, null, 500) : cb(null, result, 200);
      }
    );
  },

  create(meeting, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!meeting || typeof meeting !== "object") {
      return cb(new Error("Meeting-profile is required"), null);
    }

    // extract parameters
    const {
      station_id,
      meeting_type_id,
      tag,
      held_at: held_on,
      statistic,
    } = meeting;

    if (!tag || !tag.trim()) {
      return cb(new Error("Tag is required"), null);
    }

    this.findByStationAndMeetingTypeAndDate(
      station_id,
      meeting_type_id,
      held_on,
      (err0, lastMeeting, code = 400) => {
        if (err0 && code !== 404) {
          return cb(err0, null, code);
        }

        if (lastMeeting) {
          return cb(new Error("Meeting already saved"), null, 409);
        }

        // begin transaction here
        db.beginTransaction((err1) => {
          if (err1) {
            return cb(err1, null, 500);
          }

          db.query(
            "INSERT INTO meetings (meeting_type_id, station_id, tag, held_on) VALUES (?, ?, ?, ?)",
            [meeting_type_id, station_id, tag, held_on],
            (err, result) => {
              if (err) {
                // console.log(`[meeting-error]: ${JSON.stringify(err, null, 2)}`);
                return db.rollback(() =>
                  cb(new Error("Meeting cannot be created"), null, 500)
                );
              }

              // set the meeting-id
              const meeting_id = result.insertId;

              if (!statistic || typeof statistic !== "object") {
                return db.commit((err3) => {
                  if (err3) {
                    return db.rollback(() => cb(err3, null, 500));
                  }

                  return cb(null, { id: meeting_id, ...meeting }, 201);
                });
              }

              statisticService.create(meeting_id, statistic, (err4, stat) => {
                if (err4) {
                  return db.rollback(() => cb(err4, null, 500));
                }

                return db.commit((err5) => {
                  if (err5) {
                    return db.rollback(() => cb(err5, null, 500));
                  }

                  return cb(
                    null,
                    { id: meeting_id, ...meeting, statistic: stat },
                    201
                  );
                });
              });
            }
          );
        });
      }
    );
  },

  findByStationAndMeetingTypeAndDate: (
    station_id,
    meeting_type_id,
    held_on,
    cb
  ) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!station_id || isNaN(station_id)) {
      return cb(new Error("Station-id is required"), null);
    }

    if (!meeting_type_id || isNaN(meeting_type_id)) {
      return cb(new Error("Meeting-Type-id is required"), null);
    }

    if (!held_on || !held_on.trim()) {
      return cb(new Error("Meeting-date is required"), null);
    }

    db.query(
      `SELECT tag, held_on, mt.name meeting_type, s.name station FROM meetings m
      LEFT JOIN meeting_types mt ON mt.id = m.meeting_type_id
      LEFT JOIN stations s ON s.id = m.station_id
      WHERE station_id = ? AND meeting_type_id = ? AND DATE(held_on) = ?`,
      [station_id, meeting_type_id, held_on],
      (err, result) => {
        if (err) {
          return cb(err, null, 500);
        }

        let meeting; // check-case: result[0] is null
        if (!(meeting = result[0])) {
          return cb(new Error("Meeting not found"), null, 404);
        }

        statisticService.get(id, (err1, statistics) => {
          return err1
            ? cb(new Error("Stats could not be retrieved"), null, 500)
            : cb(null, { ...meeting, statistics }, 200);
        });
      }
    );
  },

  edit(id, meeting, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!meeting || typeof meeting !== "object") {
      return cb(new Error("Meeting-profile is required"), null);
    }

    // extract parameters
    const { station_id, meeting_type_id, tag, held_at: held_on } = meeting;

    if (!station_id || isNaN(station_id)) {
      return cb(new Error("Meeting-station is required"), null);
    }

    if (!meeting_type_id || isNaN(meeting_type_id)) {
      return cb(new Error("Meeting-type is required"), null);
    }

    if (!tag || !tag.trim()) {
      return cb(new Error("Tag is required"), null);
    }

    this.find(id, (err0, lastMeeting, code = 400) => {
      if (err0) {
        return cb(err0, null, code);
      }

      if (station_id != lastMeeting.station_id) {
        return cb(new Error("Meeting-station/venue cannot be updated"), null);
      }

      if (
        held_on != lastMeeting.held_on &&
        lastMeeting.statistics &&
        lastMeeting.statistics.length !== 0
      ) {
        return cb(new Error("Meeting-date cannot be updated"), null);
      }

      db.query(
        "UPDATE meetings SET meeting_type_id = ?, tag = ?, held_on = ? WHERE id = ? AND station_id = ?",
        [meeting_type_id, tag, held_on, id, station_id],
        (err, result) => {
          return err
            ? cb(new Error("Meeting cannot be updated"), null, 500)
            : cb(null, meeting, 204);
        }
      );
    });
  },

  find: (id, cb) => {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!id || isNaN(id)) {
      return cb(new Error("Meeting-id is required"), null);
    }

    db.query(
      `SELECT tag, held_on, mt.name meeting_type, s.name station FROM meetings m
      LEFT JOIN meeting_types mt ON mt.id = m.meeting_type_id
      LEFT JOIN stations s ON s.id = m.station_id WHERE m.id = ?`,
      [id],
      (err, result) => {
        if (err) {
          return cb(err, null, 500);
        }

        let meeting; // check-case: result[0] is null
        if (!(meeting = result[0])) {
          return cb(new Error("Meeting not found"), null, 404);
        }

        statisticService.get(id, (err1, statistics) => {
          return err1
            ? cb(new Error("Stats could not be retrieved"), null, 500)
            : cb(null, { ...meeting, statistics }, 200);
        });
      }
    );
  },
};
