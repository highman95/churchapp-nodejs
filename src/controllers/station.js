const stationService = require("../services/station");

module.exports = {
  get: (req, res, next) => {
    try {
      stationService.get((err, stations) => {
        if (err) {
          res.status(400).json({ status: false, message: err.message });
          return;
        }

        res.json({
          status: true,
          data: stations,
          message: "Stations successfully fetched",
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
    stationService.get((err, stations) => {
      res.render("stations", {
        title: "Stations",
        stations: err ? [] : stations,
      });
    });
  },

  create: (req, res, next) => {
    try {
      stationService.create(req.body, (err, station, code = 400) => {
        if (err) {
          res.status(code).json({ status: false, message: err.message });
          return;
        }

        res.status(code).json({
          status: true,
          data: station,
          message: "Station successfully created",
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
