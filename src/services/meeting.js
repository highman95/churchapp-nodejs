const statisticService = require("./statistic");

module.exports = {
  get: (callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      `SELECT m.id, tag, held_on, mt.name meeting_type, l.name location FROM meetings m
      LEFT JOIN meeting_types mt ON mt.id = m.meeting_type_id
      LEFT JOIN locations l ON l.id = m.location_id ORDER BY held_on`,
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result);
      }
    );
  },

  create(meeting, callBack) {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!meeting || typeof meeting !== "object") {
      return callBack(new Error("Meeting-profile is required"), null);
    }

    // extract parameters
    const {
      location_id,
      meeting_type_id,
      tag,
      held_at: held_on,
      statistic,
    } = meeting;

    if (!tag || !tag.trim()) {
      return callBack(new Error("Tag is required"), null);
    }

    this.findByLocationAndMeetingTypeAndDate(
      location_id,
      meeting_type_id,
      held_on,
      (err0, lastMeeting) => {
        if (err0) {
          return callBack(err0, null, 500);
        }

        if (lastMeeting) {
          return callBack(new Error("Meeting already saved"), null, 409);
        }

        // begin transaction here
        db.beginTransaction((err1) => {
          if (err1) {
            return callBack(err1, null, 500);
          }

          db.query(
            "INSERT INTO meetings (meeting_type_id, location_id, tag, held_on) VALUES (?, ?, ?, ?)",
            [meeting_type_id, location_id, tag, held_on],
            (err, result) => {
              if (err) {
                // console.log(`[meeting-error]: ${JSON.stringify(err, null, 2)}`);
                return db.rollback(() =>
                  callBack(new Error("Meeting cannot be created"), null, 500)
                );
              }

              // set the meeting-id
              const meeting_id = result.insertId;

              if (!statistic || typeof statistic !== "object") {
                return db.commit((err3) => {
                  if (err3) {
                    return db.rollback(() => callBack(err3, null, 500));
                  }

                  return callBack(null, { id: meeting_id, ...meeting }, 201);
                });
              }

              statisticService.create(meeting_id, statistic, (err4, stat) => {
                if (err4) {
                  return db.rollback(() => callBack(err4, null, 500));
                }

                return db.commit((err5) => {
                  if (err5) {
                    return db.rollback(() => callBack(err5, null, 500));
                  }

                  return callBack(
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

  findByLocationAndMeetingTypeAndDate: (
    location_id,
    meeting_type_id,
    held_on,
    callBack
  ) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!location_id || isNaN(location_id)) {
      return callBack(new Error("Location-id is required"), null);
    }

    if (!meeting_type_id || isNaN(meeting_type_id)) {
      return callBack(new Error("Meeting-Type-id is required"), null);
    }

    if (!held_on || !held_on.trim()) {
      return callBack(new Error("Meeting-date is required"), null);
    }

    db.query(
      `SELECT tag, held_on, mt.name meeting_type, l.name location FROM meetings m
      LEFT JOIN meeting_types mt ON mt.id = m.meeting_type_id
      LEFT JOIN locations l ON l.id = m.location_id
      WHERE location_id = ? AND meeting_type_id = ? AND DATE(held_on) = ?`,
      [location_id, meeting_type_id, held_on],
      (err, result) => {
        if (err) {
          return callBack(err, null, 500);
        }

        let meeting; // check-case: result[0] is null
        if (!(meeting = result[0])) {
          return callBack(null, meeting);
        }

        statisticService.get(id, (err1, statistics) => {
          return err1
            ? callBack(new Error("Stats could not be retrieved"), null, 500)
            : callBack(null, { ...meeting, statistics }, 200);
        });
      }
    );
  },

  find: (id, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!id || isNaN(id)) {
      return callBack(new Error("Resource-id is required"), null);
    }

    db.query(
      `SELECT tag, held_on, mt.name meeting_type, l.name location FROM meetings m
      LEFT JOIN meeting_types mt ON mt.id = m.meeting_type_id
      LEFT JOIN locations l ON l.id = m.location_id WHERE m.id = ?`,
      [id],
      (err, result) => {
        if (err) {
          return callBack(err, null, 500);
        }

        let meeting; // check-case: result[0] is null
        if (!(meeting = result[0])) {
          return callBack(null, meeting, 404);
        }

        statisticService.get(id, (err1, statistics) => {
          return err1
            ? callBack(new Error("Stats could not be retrieved"), null, 500)
            : callBack(null, { ...meeting, statistics }, 200);
        });
      }
    );
  },
};
