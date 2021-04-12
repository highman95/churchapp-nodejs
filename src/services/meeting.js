const statisticService = require("./statistic");

module.exports = {
  get: (callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      `SELECT id, tag, mno, held_at, mt.name meeting_type, l.name location FROM meetings m
      LEFT JOIN meeting_types mt ON mt.id = m.meeting_type_id
      LEFT JOIN locations l ON l.id = m.location_id ORDER BY held_at`,
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result);
      }
    );
  },

  create: (meeting) => {},

  find: (id, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!id || isNaN(id)) {
      return callBack(new Error("Resource-id is required"), null);
    }

    db.query(
      `SELECT tag, mno, held_at, mt.name meeting_type, l.name location FROM meetings m
      LEFT JOIN meeting_types mt ON mt.id = m.meeting_type_id
      LEFT JOIN locations l ON l.id = m.location_id WHERE id = ?`,
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
