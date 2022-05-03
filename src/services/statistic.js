const { findResultHandler } = require("./common");
const modelName = "Statistic";

module.exports = {
  get(meeting_id, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!meeting_id || isNaN(meeting_id)) {
      return cb(new Error("Meeting-id is required"), null);
    }

    db.query(
      "SELECT * FROM statistics WHERE meeting_id = ? ORDER BY mno, held_at",
      [meeting_id],
      (err, result) => {
        return err ? cb(err, null, 500) : cb(null, result, 200);
      }
    );
  },

  create(meeting_id, statistic, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!statistic || typeof statistic !== "object") {
      return cb(new Error("Statistics are required"), null);
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
      held_at = new Date().toISOString().slice(0, 19),
    } = statistic;

    this.findByMno(meeting_id, mno, (err0, stats, code = 400) => {
      if (err0 && code !== 404) {
        return cb(err0, null, code);
      }

      if (stats) {
        return cb(new Error("Statistics already saved"), null, 409);
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
            ? cb(err, null, 500)
            : cb(null, { id: result.insertId }, 201);
        }
      );
    });
  },

  findByMno(meeting_id, mno, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!meeting_id || isNaN(meeting_id)) {
      return cb(new Error("Meeting-id is required"), null);
    }

    // i.e. session-1, session-2, e.t.c
    if (!mno || isNaN(mno)) {
      return cb(new Error("Meeting-no is required"), null);
    }

    db.query(
      "SELECT * FROM statistics WHERE meeting_id = ? AND mno = ?",
      [meeting_id, mno],
      findResultHandler(modelName, cb)
    );
  },

  update(meeting_id, id, statistic, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!statistic || typeof statistic !== "object") {
      return cb(new Error("Statistics are required"), null);
    }

    this.find(meeting_id, id, (err0, stat, code = 400) => {
      if (err0) {
        return cb(err0, null, code);
      }

      if (stat.mno !== mno) {
        return cb(new Error("Meeting-number must be similar"), null, 409);
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
          const code0 = result.changedRows ? 204 : 304;
          return err ? cb(err, null, 500) : cb(null, statistic, code0);
        }
      );
    });
  },

  find(meeting_id, id, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!meeting_id || isNaN(meeting_id)) {
      return cb(new Error("Meeting-id is required"), null);
    }

    if (!id || isNaN(id)) {
      return cb(new Error("Resource-id is required"), null);
    }

    db.query(
      "SELECT * FROM statistics WHERE id = ? AND meeting_id = ?",
      [id, meeting_id],
      findResultHandler(modelName, cb)
    );
  },
};
