const { formatToDateOnly } = require("../utils/helpers");
const meetingService = require("./meeting");

exports.dailyAttendanceSummary = (station_id, month_year, cb) => {
  if (!station_id || isNaN(station_id)) {
    return cb(new Error("Station id is required"), null);
  }

  if (!month_year || !month_year.trim()) {
    return cb(new Error("Month/Year is required"), null);
  }

  const [year, month] = month_year.split("-");
  if (!year || isNaN(year) || !month || isNaN(month)) {
    return cb(new Error("Month/Year contains invalid data"), null);
  }

  meetingService.fetchSchedulesByMonthYear(
    station_id,
    month,
    year,
    (err, schedules) => {
      if (err) {
        return cb(
          new Error(`Unable to fetch schedules for ${month}/${year}`),
          null
        );
      }

      let records = [];
      return !schedules || schedules.length === 0
        ? cb(null, records)
        : schedules.forEach(
            getMeetingDayAttendanceRecords(
              station_id,
              records,
              schedules.length,
              cb
            )
          );
    }
  );
};

exports.dailyIncomeSummary = (station_id, month_year, cb) => {
  if (!station_id || isNaN(station_id)) {
    return cb(new Error("Station id is required"), null);
  }

  if (!month_year || !month_year.trim()) {
    return cb(new Error("Month/Year is required"), null);
  }

  const [year, month] = month_year.split("-");
  if (!year || isNaN(year) || !month || isNaN(month)) {
    return cb(new Error("Month/Year contains invalid data"), null);
  }

  meetingService.fetchSchedulesByMonthYear(
    station_id,
    month,
    year,
    (err, schedules) => {
      if (err) {
        return cb(
          new Error(`Unable to fetch schedules for ${month}/${year}`),
          null
        );
      }

      let records = [];
      return !schedules || schedules.length === 0
        ? cb(null, records)
        : schedules.forEach(
            getMeetingDayIncomeRecords(
              station_id,
              records,
              schedules.length,
              cb
            )
          );
    }
  );
};

function getMeetingDayAttendanceRecords(
  station_id,
  records,
  meeting_days_count,
  cb
) {
  return (schedule, index) => {
    meetingService.fetchDailyAttendanceRecords(
      station_id,
      schedule.held_on,
      false,
      onFetchedMeetingDayRecords(
        schedule.held_on,
        records,
        index,
        meeting_days_count,
        cb
      )
    );
  };
}

function getMeetingDayIncomeRecords(
  station_id,
  records,
  meeting_days_count,
  cb
) {
  return (schedule, index) => {
    meetingService.fetchDailyIncomeRecords(
      station_id,
      schedule.held_on,
      false,
      onFetchedMeetingDayRecords(
        schedule.held_on,
        records,
        index,
        meeting_days_count,
        cb
      )
    );
  };
}

function onFetchedMeetingDayRecords(
  date,
  records,
  index,
  meeting_days_count,
  cb
) {
  return (err1, data) => {
    if (err1) {
      return cb(
        new Error(
          `Unable to fetch meeting records for ${formatToDateOnly(date)}`
        )
      );
    }

    records.push(data);

    if (index + 1 === meeting_days_count) {
      return cb(null, records);
    }
  };
}
