"use strict";

const {
  isInTheFuture,
  computePaginationParameters,
} = require("../utils/helpers");
const { ensureCallBackIsDefined } = require("../utils/validation");
const { findResultHandler } = require("./common");
const statisticService = require("./statistic");
const modelName = "Meeting";

exports.get = function (organization_id, page, size, cb) {
  ensureCallBackIsDefined(cb);

  if (!organization_id || isNaN(organization_id)) {
    return cb(new Error("Organization-id is required"), null);
  }

  const { limit, offset } = computePaginationParameters(page, size);

  const sql = `SELECT {expectations} FROM meetings m
               LEFT JOIN meeting_types mt ON mt.id = m.meeting_type_id
               LEFT JOIN stations s ON s.id = m.station_id
               WHERE s.organization_id = ? ORDER BY held_on, m.id`;

  db.query(
    `${sql.replace("{expectations}", "COUNT(m.id) as count")}`,
    [organization_id],
    (err0, meetings) => {
      if (err0) {
        return cb(new Error("All Meetings could not fetched"), null, 500);
      }

      const count = meetings[0]?.count ?? 0;
      if (count === 0) {
        return cb(null, { data: [], count }, 200);
      }

      db.query(
        `${sql.replace(
          "{expectations}",
          "m.id, tag, held_on, mt.name meeting_type, s.name station"
        )} LIMIT ${offset}, ${limit}`,
        [organization_id],
        (err1, meetingsInPage) => {
          return err1
            ? cb(new Error("Meetings could not fetched"), null, 500)
            : cb(null, { data: meetingsInPage, count }, 200);
        }
      );
    }
  );
};

exports.create = function (meeting, cb) {
  ensureCallBackIsDefined(cb);

  if (!meeting || typeof meeting !== "object") {
    return cb(new Error("Meeting-profile is required"), null);
  }

  // extract parameters
  const { station_id, meeting_type_id, tag, held_on } = meeting;

  if (!tag?.trim()) {
    return cb(new Error("Tag is required"), null);
  }

  findByStationAndMeetingTypeAndDate(
    station_id,
    meeting_type_id,
    held_on,
    onCheckedNonExistenceCreateMeeting(meeting, cb)
  );
};

exports.edit = function (organization_id, id, meeting, cb) {
  ensureCallBackIsDefined(cb);

  if (!meeting || typeof meeting !== "object") {
    return cb(new Error("Meeting-profile is required"), null);
  }

  // extract parameters
  const { station_id, meeting_type_id, tag } = meeting;

  if (!station_id || isNaN(station_id)) {
    return cb(new Error("Meeting-station is required"), null);
  }

  if (!meeting_type_id || isNaN(meeting_type_id)) {
    return cb(new Error("Meeting-type is required"), null);
  }

  if (!tag?.trim()) {
    return cb(new Error("Tag is required"), null);
  }

  find(organization_id, id, onCheckedExistenceUpdateMeeting(id, meeting, cb));
};

function find(organization_id, id, cb) {
  ensureCallBackIsDefined(cb);

  if (!organization_id || isNaN(organization_id)) {
    return cb(new Error("Organization-id is required"), null);
  }

  if (!id || isNaN(id)) {
    return cb(new Error("Meeting-id is required"), null);
  }

  db.query(
    `SELECT m.id, tag, held_on, mt.name meeting_type, s.name station FROM meetings m
     LEFT JOIN meeting_types mt ON mt.id = m.meeting_type_id
     LEFT JOIN stations s ON s.id = m.station_id WHERE m.id = ? AND s.organization_id = ? LIMIT 1`,
    [id, organization_id],
    onFoundResultFetchStatistics(cb)
  );
}
exports.find = find;

exports.fetchSchedulesByMonthYear = (station_id, month, year, cb) => {
  ensureCallBackIsDefined(cb);

  const sql = `SELECT DISTINCT held_on FROM meetings
               WHERE station_id = ? AND MONTH(held_on) = ? AND YEAR(held_on) = ? ORDER BY held_on`;

  db.query(sql, [station_id, month, year], (err, data) => {
    return err
      ? cb(new Error("Unable to fetch service dates"), null)
      : cb(null, data);
  });
};

exports.fetchDailyAttendanceRecords = (
  station_id,
  held_on,
  do_aggregate,
  cb
) => {
  ensureCallBackIsDefined(cb);

  const sql = `SELECT m.id, m.held_on, m.tag, mt.name meeting_type, SUM(male) male, SUM(female) female,
                SUM(children) children, SUM(converts) converts, SUM(first_timers) first_timers,
                SUM(male + female) total_adults, SUM(male + female + children) total_attendance
               FROM meetings m
               LEFT JOIN statistics s ON s.meeting_id = m.id
               LEFT JOIN meeting_types mt ON mt.id = m.meeting_type_id
               WHERE m.station_id = ? AND DATE(m.held_on) = DATE(?) ${
                 do_aggregate ? " GROUP BY DATE(m.held_on), mno" : "" // sum up by 1st, 2nd, 3rd, etc. services
               }`;

  db.query(sql, [station_id, held_on], (err, data) => {
    return err
      ? cb(new Error("Unable to fetch daily-meeting attendance records"), null)
      : cb(null, data);
  });
};

exports.fetchDailyIncomeRecords = (station_id, held_on, do_aggregate, cb) => {
  ensureCallBackIsDefined(cb);

  const sql = `SELECT m.id, m.held_on, m.tag, mt.name meeting_type, SUM(tithe) tithe, SUM(tithe_chq) tithe_chq, SUM(worship) worship, SUM(worship_chq) worship_chq,
                SUM(project) project, SUM(project_chq) as project_chq, SUM(thanksgiving) thanksgiving, SUM(thanksgiving_chq) thanksgiving_chq,
                SUM(tithe + tithe_chq + worship + worship_chq + project + project_chq + thanksgiving + thanksgiving_chq) total_income,
                SUM(tithe + tithe_chq) total_tithe, SUM(worship + worship_chq) total_worship, SUM(project + project_chq) total_project,
                SUM(shiloh_sac + shiloh_sac_chq) total_shiloh_sac, SUM(thanksgiving + thanksgiving_chq) total_thanksgiving,
                SUM(tithe + tithe_chq + worship + worship_chq + project + project_chq + shiloh_sac + shiloh_sac_chq + thanksgiving + thanksgiving_chq) grand_total_income
               FROM meetings m
               LEFT JOIN statistics s ON s.meeting_id = m.id
               LEFT JOIN meeting_types mt ON mt.id = m.meeting_type_id
               WHERE m.station_id = ? AND DATE(m.held_on) = DATE(?) ${
                 do_aggregate ? " GROUP BY DATE(m.held_on), mno" : "" // sum up by 1st, 2nd, 3rd, etc. services
               }`;

  db.query(sql, [station_id, held_on], (err, data) => {
    return err
      ? cb(new Error("Unable to fetch daily-meeting income records"), null)
      : cb(null, data);
  });
};

function findByStationAndMeetingTypeAndDate(
  station_id,
  meeting_type_id,
  held_on,
  cb
) {
  ensureCallBackIsDefined(cb);

  if (!station_id || isNaN(station_id)) {
    return cb(new Error("Station-id is required"), null);
  }

  if (!meeting_type_id || isNaN(meeting_type_id)) {
    return cb(new Error("Meeting-Type-id is required"), null);
  }

  if (!held_on?.trim()) {
    return cb(new Error("Meeting-date is required"), null);
  }

  if (isInTheFuture(held_on)) {
    return cb(new Error("Meeting-date cannot be a future date"), null);
  }

  db.query(
    `SELECT m.id, tag, held_on, mt.name meeting_type, s.name station FROM meetings m
     LEFT JOIN meeting_types mt ON mt.id = m.meeting_type_id
     LEFT JOIN stations s ON s.id = m.station_id
     WHERE station_id = ? AND meeting_type_id = ? AND DATE(held_on) = DATE(?) LIMIT 1`,
    [station_id, meeting_type_id, held_on],
    onFoundResultFetchStatistics(cb)
  );
}

function onCheckedNonExistenceCreateMeeting(meeting, cb) {
  return (err0, lastMeeting, code = 400) => {
    if (err0 && code !== 404) {
      return cb(err0, null, code);
    }

    if (lastMeeting) {
      return cb(new Error("Meeting already saved"), null, 409);
    }

    const { station_id, meeting_type_id, tag, held_on, statistic } = meeting;

    // begin transaction here
    db.beginTransaction((err1) => {
      if (err1) {
        return cb(err1, null, 500);
      }

      db.query(
        "INSERT INTO meetings (meeting_type_id, station_id, tag, held_on) VALUES (?, ?, ?, ?)",
        [meeting_type_id, station_id, tag, held_on],
        onCreatedMeetingAddStatistic(statistic)
      );
    });
  };

  function onCreatedMeetingAddStatistic(statistic) {
    return (err, result) => {
      if (err) {
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

      statisticService.create(
        meeting_id,
        statistic,
        onAddedStatisticFinalizeTransaction(meeting_id)
      );
    };
  }

  function onAddedStatisticFinalizeTransaction(meeting_id) {
    return (err4, stat) => {
      if (err4) {
        return db.rollback(() => cb(err4, null, 500));
      }

      return db.commit((err5) => {
        if (err5) {
          return db.rollback(() => cb(err5, null, 500));
        }

        return cb(null, { id: meeting_id, ...meeting, statistic: stat }, 201);
      });
    };
  }
}

function onCheckedExistenceUpdateMeeting(id, meeting, cb) {
  return (err0, lastMeeting, code = 400) => {
    if (err0) {
      return cb(err0, null, code);
    }

    // extract parameters
    const { station_id, meeting_type_id, tag, held_on } = meeting;

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
      (err, _) => {
        return err
          ? cb(new Error("Meeting cannot be updated"), null, 500)
          : cb(null, meeting, 204);
      }
    );
  };
}

function onFoundResultFetchStatistics(cb) {
  return findResultHandler(modelName, cb, (meeting) => {
    return statisticService.get(meeting.id, (err0, statistics) => {
      return err0
        ? cb(new Error("Stats could not be retrieved"), null, 500)
        : cb(null, { ...meeting, statistics }, 200);
    });
  });
}
