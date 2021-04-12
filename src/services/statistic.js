module.exports = {
  get: (meeting_id, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    db.query(
      `SELECT s.* FROM statistics s LEFT JOIN meetings m ON m.id = s.meeting_id
      WHERE meeting_id = ? ORDER BY m.held_at`,
      [meeting_id],
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result);
      }
    );
  },

  create: (statistic) => {},

  find: (id, meeting_id, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!id || isNaN(id)) {
      return callBack(new Error("Resource-id is required"), null);
    }

    if (!meeting_id || isNaN(meeting_id)) {
      return callBack(new Error("Meeting-id is required"), null);
    }

    db.query(
      "SELECT * FROM statistics WHERE id = ? AND meeting_id = ?",
      [id, meeting_id],
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result[0]);
      }
    );
  },
};
