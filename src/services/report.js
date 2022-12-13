"use strict";

const { formatToDateOnly } = require("../utils/helpers");
const meetingService = require("./meeting");
const statisticService = require("./statistic");

exports.dailyAttendanceSummary = (station_id, month_year, cb) => {
  if (!station_id || isNaN(station_id)) {
    return cb(new Error("Station id is required"), null);
  }

  if (!month_year?.trim()) {
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
          null,
          500
        );
      }

      let records = { data: [], meta: {} };
      return (schedules?.length ?? 0) === 0
        ? cb(null, records, 200)
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

  if (!month_year?.trim()) {
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
          null,
          500
        );
      }

      let records = { data: [], meta: {} };
      return (schedules?.length ?? 0) === 0
        ? cb(null, records, 200)
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

exports.missionStationPeriodicSummary = (
  station_id,
  from_month_year,
  to_month_year,
  cb
) => {
  if (!station_id || isNaN(station_id)) {
    return cb(new Error("Station id is required"), null);
  }

  if (!from_month_year?.trim() || !to_month_year?.trim()) {
    return cb(new Error("Period range (month/year) is required"), null);
  }

  if (Date.parse(from_month_year) > Date.parse(to_month_year)) {
    return cb(new Error("Period range is invalid"), null, 406);
  }

  // compute period in-view
  const periods = computePeriods(from_month_year, to_month_year);

  // initialize records after screening filters
  const records = {
    periods,
    total_first_timers: [],
    total_converts: [],
    total_tithes: [],
    total_worships: [],
    total_projects: [],
    total_thanksgivings: [],
    total_shiloh_sacs: [],
    total_incomes: [],
    total_titheables: [],
    total_payable_tithes: [],
    total_hq_remittances: [],
    total_reserves: [],
  };

  return periods.length === 0
    ? cb(null, records, 200)
    : periods.forEach(
        getMissionStationStatistics(station_id, records, periods.length, cb)
      );
};

function computePeriods(from_month_year, to_month_year) {
  const [from_year, from_month] = from_month_year.split("-");
  const [to_year, to_month] = to_month_year.split("-");

  const from_month_0 = parseInt(from_month);
  const from_year_0 = parseInt(from_year);
  const to_month_0 = parseInt(to_month);
  const to_year_0 = parseInt(to_year);

  let periods = [];

  if (from_year_0 === to_year_0) {
    for (let i = from_month_0; i <= to_month_0; i++) {
      periods.push({ month: i, year: from_year_0 });
    }
  } else {
    for (let i = from_month_0; i <= 12; i++) {
      periods.push({ month: i, year: from_year_0 });
    }

    for (let j = 1; j <= to_month_0; j++) {
      periods.push({ month: j, year: to_year_0 });
    }
  }

  return periods;
}

function getMissionStationStatistics(station_id, records, period_length, cb) {
  return ({ month, year }, index) => {
    statisticService.getTotalAttendees(
      station_id,
      month,
      year,
      (_err0, data0) => {
        const { total_first_timers, total_converts } = data0?.[0] ?? {}; // row-0 attendance records

        records.total_first_timers.push(total_first_timers ?? 0);
        records.total_converts.push(total_converts ?? 0);

        statisticService.getTotalIncomes(
          station_id,
          month,
          year,
          (_err, data) => {
            const {
              total_tithes,
              total_worships,
              total_projects,
              total_thanksgivings,
              total_shiloh_sacs,
              total_incomes,
              total_titheables,
            } = data?.[0] ?? {}; // row-0 income-records

            records.total_tithes.push(total_tithes ?? 0);
            records.total_worships.push(total_worships ?? 0);
            records.total_projects.push(total_projects ?? 0);
            records.total_thanksgivings.push(total_thanksgivings ?? 0);
            records.total_shiloh_sacs.push(total_shiloh_sacs ?? 0);
            records.total_incomes.push(total_incomes ?? 0);
            records.total_titheables.push(total_titheables ?? 0);

            const payable_tithes = (total_titheables ?? 0) / 10;
            records.total_payable_tithes.push(payable_tithes);
            records.total_hq_remittances.push(
              total_shiloh_sacs + payable_tithes
            );

            // Reserve Account = titheable-income - (SUF/RCOF + Staff Allowances/salaries + Payable-Tithe)
            records.total_reserves.push(total_titheables - payable_tithes);

            if (index + 1 === period_length) {
              return cb(null, records, 200);
            }
          }
        );
      }
    );
  };
}

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
  return (err, data) => {
    if (err) {
      return cb(
        new Error(
          `Unable to fetch meeting records for ${formatToDateOnly(date)}`
        ),
        null,
        500
      );
    }

    records.data.push(data);
    data.forEach(computeMeta);

    if (index + 1 === meeting_days_count) {
      return cb(null, records, 200);
    }
  };

  function computeMeta({
    tithe,
    tithe_chq,
    worship,
    worship_chq,
    project,
    project_chq,
    vow = 0,
    vow_chq = 0,
    shiloh_sac = 0,
    shiloh_sac_chq = 0,
    thanksgiving,
    thanksgiving_chq,
    total_tithe,
    total_worship,
    total_project,
    total_shiloh_sac,
    total_vow = 0,
    total_thanksgiving,
    total_income,
    grand_total_income,
  }) {
    if (tithe) {
      if (!records.meta || !records.meta.tithe) {
        records.meta = {
          tithe: 0,
          tithe_chq: 0,
          worship: 0,
          worship_chq: 0,
          project: 0,
          project_chq: 0,
          shiloh_sac: 0,
          shiloh_sac_chq: 0,
          vow: 0,
          vow_chq: 0,
          thanksgiving: 0,
          thanksgiving_chq: 0,
          total_tithe: 0,
          total_worship: 0,
          total_project: 0,
          total_shiloh_sac: 0,
          total_vow: 0,
          total_thanksgiving: 0,
          total_income: 0,
          grand_total_income: 0,
        };
      }

      records.meta["tithe"] += tithe;
      records.meta["tithe_chq"] += tithe_chq;
      records.meta["worship"] += worship;
      records.meta["worship_chq"] += worship_chq;
      records.meta["project"] += project;
      records.meta["project_chq"] += project_chq;
      records.meta["shiloh_sac"] += shiloh_sac;
      records.meta["shiloh_sac_chq"] += shiloh_sac_chq;
      records.meta["vow"] += vow;
      records.meta["vow_chq"] += vow_chq;
      records.meta["thanksgiving"] += thanksgiving;
      records.meta["thanksgiving_chq"] += thanksgiving_chq;

      records.meta["total_tithe"] += total_tithe;
      records.meta["total_worship"] += total_worship;
      records.meta["total_project"] += total_project;
      records.meta["total_shiloh_sac"] += total_shiloh_sac;
      records.meta["total_vow"] += total_vow;
      records.meta["total_thanksgiving"] += total_thanksgiving;
      records.meta["total_income"] += total_income;
      records.meta["grand_total_income"] += grand_total_income;
    }
  }
}
