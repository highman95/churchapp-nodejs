const { isInTheFuture } = require("../utils/helpers");
const { findResultHandler } = require("./common");
const statisticService = require("./statistic");
const modelName = "Meeting";

exports.get = function (organization_id, page, size, cb) {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }

  if (!organization_id || isNaN(organization_id)) {
    return cb(new Error("Organization-id is required"), null);
  }

  const pageIndex = (!page ? 1 : Math.abs(parseInt(page) || 1)) - 1;
  const limit = !size ? 10 : Math.abs(parseInt(size) || 10);

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
        )} LIMIT ${pageIndex * size}, ${limit}`,
        [organization_id],
        (err1, meetingsInPage) => {
          return err1
            ? cb("Meetings could not fetched", null, 500)
            : cb(null, { data: meetingsInPage, count }, 200);
        }
      );
    }
  );
};

exports.create = function (meeting, cb) {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }

  if (!meeting || typeof meeting !== "object") {
    return cb(new Error("Meeting-profile is required"), null);
  }

  // extract parameters
  const { station_id, meeting_type_id, tag, held_on } = meeting;

  if (!tag || !tag.trim()) {
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
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }

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

  if (!tag || !tag.trim()) {
    return cb(new Error("Tag is required"), null);
  }

  find(organization_id, id, onCheckedExistenceUpdateMeeting(id, meeting, cb));
};

function find(organization_id, id, cb) {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }

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

function findByStationAndMeetingTypeAndDate(
  station_id,
  meeting_type_id,
  held_on,
  cb
) {
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

    if (!!lastMeeting) {
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
