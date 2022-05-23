const { findResultHandler } = require("./common");
const modelName = "Statistic";
const defaultMeetingNo = 1;

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

    findByMno(
      meeting_id,
      statistic.mno ?? defaultMeetingNo,
      onCheckedNonExistenceAddStatistic(meeting_id, statistic, cb)
    );
  },

  update(meeting_id, id, statistic, cb) {
    if (typeof cb !== "function") {
      throw new Error("Callback is not defined");
    }

    if (!statistic || typeof statistic !== "object") {
      return cb(new Error("Statistics are required"), null);
    }

    this.find(
      meeting_id,
      id,
      onCheckedExistenceUpdateStatistic(meeting_id, id, statistic, cb)
    );
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

  getTotalAttendees(station_id, month, year, cb) {
    const $sql = `SELECT SUM(first_timers) total_first_timers, SUM(converts) total_converts,
                    SUM(male + female + children) total_attendees
                  FROM statistics s
                  LEFT JOIN meetings m ON m.id = s.meeting_id
                  WHERE m.station_id = ? AND MONTH(held_on) = ? AND YEAR(held_on) = ?`;

    db.query($sql, [station_id, month, year], (err, data) => {
      return err
        ? cb(new Error("Unable to fetch total-attendance records"), null)
        : cb(null, data);
    });
  },

  getTotalIncomes(station_id, month, year, cb) {
    const $sql = `SELECT SUM(tithe + tithe_chq) total_tithes,
                    SUM(worship + worship_chq) total_worships,
                    SUM(project + project_chq) total_projects,
                    SUM(shiloh_sac + shiloh_sac_chq) total_shiloh_sacs,
                    SUM(thanksgiving + thanksgiving_chq) total_thanksgivings,
                    SUM(tithe + tithe_chq + worship + worship_chq + project + project_chq +
                      shiloh_sac + shiloh_sac_chq + thanksgiving + thanksgiving_chq) total_incomes,
                    SUM(shiloh_sac + shiloh_sac_chq + project + project_chq) total_titheables
                  FROM statistics s
                  LEFT JOIN meetings m ON m.id = s.meeting_id
                  WHERE m.station_id = ? AND EXTRACT(MONTH FROM held_on) = ? AND EXTRACT(YEAR FROM held_on) = ?`;

    db.query($sql, [station_id, month, year], (err, data) => {
      return err
        ? cb(new Error("Unable to fetch total-income records", null))
        : cb(null, data);
    });
  },
};

function findByMno(meeting_id, mno, cb) {
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
}

function onCheckedNonExistenceAddStatistic(meeting_id, statistic, cb) {
  return (err0, stats, code = 400) => {
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
      composeCreateStat(),
      (err, result) => {
        if (err) {
          console.log("insert-stat-error -> ", err.code, err.sqlMessage);
        }

        return err
          ? cb(new Error("Statistic cannot be saved"), null, 500)
          : cb(null, { id: result.insertId, ...statistic }, 201);
      }
    );
  };

  function composeCreateStat() {
    // extract parameters
    const {
      mno = defaultMeetingNo,
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

    return [
      male || 0,
      female || 0,
      children || 0,
      converts || 0,
      first_timers || 0,
      testimonies || 0,
      tithe || 0,
      worship || 0,
      project || 0,
      shiloh_sac || 0,
      vow || 0,
      held_at,
      mno,
      meeting_id,
    ];
  }
}

function onCheckedExistenceUpdateStatistic(meeting_id, id, statistic, cb) {
  return (err0, stat, code = 400) => {
    if (err0) {
      return cb(err0, null, code);
    }

    if (stat.mno !== mno) {
      return cb(new Error("Meeting-number must be similar"), null, 409);
    }

    db.query(
      `UPDATE statistics SET male = ?, female = ?, children = ?, converts = ?,
        first_timers = ?, testimonies = ?, tithe = ?, worship = ?, project = ?,
        shiloh_sac = ?, vow = ? WHERE id = ? AND meeting_id = ?`,
      composeUpdateStat(),
      (err, result) => {
        const code0 = result.changedRows ? 204 : 304;
        return err ? cb(err, null, 500) : cb(null, statistic, code0);
      }
    );
  };

  function composeUpdateStat() {
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

    return [
      male || 0,
      female || 0,
      children || 0,
      converts || 0,
      first_timers || 0,
      testimonies || 0,
      tithe || 0,
      worship || 0,
      project || 0,
      shiloh_sac || 0,
      vow || 0,
      id,
      meeting_id,
    ];
  }
}
