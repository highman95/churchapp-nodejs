const stationService = require("../services/station");

module.exports = {
  get: (req, res, next) => {
    try {
      const { organization_id } = (req.auth || {}).user || {};

      stationService.get(organization_id, (err, stations, code = 400) => {
        res.status(code).json({
          status: !err,
          data: stations,
          message: err ? err.message : "Stations successfully fetched",
        });
      });
    } catch (e) {
      next(e);
    }
  },

  /**
   * View-page for all-stations
   *
   * @param {object} req
   * @param {object} res
   */
  view: (req, res) => {
    const { organization_id } = (req.auth || {}).user || {};

    stationService.get(organization_id, (err, stations) => {
      res.render("stations", {
        title: "Stations",
        stations: err ? [] : stations,
      });
    });
  },

  create: (req, res, next) => {
    try {
      stationService.create(req.body, (err, station, code = 400) => {
        res.status(code).json({
          status: !err,
          data: station,
          message: err ? err.message : "Station successfully created",
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
