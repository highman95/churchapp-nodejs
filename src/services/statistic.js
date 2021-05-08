module.exports = {
  get: (meeting_id, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!meeting_id || isNaN(meeting_id)) {
      return callBack(new Error("Meeting-id is required"), null);
    }

    db.query(
      "SELECT * FROM statistics WHERE meeting_id = ? ORDER BY mno, held_at",
      [meeting_id],
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result);
      }
    );
  },

  create(meeting_id, statistic, callBack) {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!statistic || typeof statistic !== "object") {
      return callBack(new Error("Statistics are required"), null);
    }

    // extract parameters
    const {
      mno = 1,
      male,
      female,
      children,
      converts,
      first_timers,
      testimonies,
      tithe,
      worship,
      project,
      shiloh_sac,
      vow,
      held_at,
    } = statistic;

    this.findByMno(meeting_id, mno, (err0, stats) => {
      if (err0) {
        return callBack(err0, null, 500);
      }

      if (stats) {
        return callBack(new Error("Statistics already saved"), null, 409);
      }

      db.query(
        `INSERT INTO statistics (male, female, children, converts, first_timers,
        testimonies, tithe, worship, project, shiloh_sac, vow, held_at, mno, meeting_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          male,
          female,
          children,
          converts,
          first_timers,
          testimonies,
          tithe,
          worship,
          project,
          shiloh_sac,
          vow,
          held_at,
          mno,
          meeting_id,
        ],
        (err, result) => {
          return err
            ? callBack(err, null, 500)
            : callBack(null, { id: result.insertId, ...location }, 201);
        }
      );
    });
  },

  findByMno: (meeting_id, mno, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!meeting_id || isNaN(meeting_id)) {
      return callBack(new Error("Meeting-id is required"), null);
    }

    // i.e. session-1, session-2, e.t.c
    if (!mno || isNaN(mno)) {
      return callBack(new Error("Meeting-no is required"), null);
    }

    db.query(
      "SELECT * FROM statistics WHERE meeting_id = ? AND mno = ?",
      [meeting_id, mno],
      (err, result) => {
        return err ? callBack(err, null) : callBack(null, result[0]);
      }
    );
  },

  update(meeting_id, id, statistic, callBack) {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!statistic || typeof statistic !== "object") {
      return callBack(new Error("Statistics are required"), null);
    }

    this.find(meeting_id, id, (err0, stat) => {
      if (err0) {
        return callBack(err0, null, 500);
      }

      if (!stat) {
        return callBack(new Error("Statistics not found"), null, 404);
      }

      if (stat.mno !== mno) {
        return callBack(new Error("Meeting-number must be similar"), null, 409);
      }

      // extract parameters
      const {
        male,
        female,
        children,
        converts,
        first_timers,
        testimonies,
        tithe,
        worship,
        project,
        shiloh_sac,
        vow,
      } = statistic;

      db.query(
        `UPDATE statistics SET male = ?, female = ?, children = ?, converts = ?,
        first_timers = ?, testimonies = ?, tithe = ?, worship = ?, project = ?,
        shiloh_sac = ?, vow = ? WHERE id = ? AND meeting_id = ?`,
        [
          male,
          female,
          children,
          converts,
          first_timers,
          testimonies,
          tithe,
          worship,
          project,
          shiloh_sac,
          vow,
          id,
          meeting_id,
        ],
        (err, result) => {
          return err
            ? callBack(err, null, 500)
            : callBack(null, statistic, result.changedRows ? 204 : 304);
        }
      );
    });
  },

  find: (meeting_id, id, callBack) => {
    if (typeof callBack !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!meeting_id || isNaN(meeting_id)) {
      return callBack(new Error("Meeting-id is required"), null);
    }

    if (!id || isNaN(id)) {
      return callBack(new Error("Resource-id is required"), null);
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
