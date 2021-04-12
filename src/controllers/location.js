const locationService = require("../services/location");

module.exports = {
  get: (req, res, next) => {
    try {
      locationService.get((err, locations) => {
        if (err) {
          res.status(400).json({ status: false, message: err.message });
          return;
        }

        res.json({
          status: true,
          data: locations,
          message: "Location successfully fetched",
        });
      });
    } catch (e) {
      next(e);
    }
  },

  /**
   * View-page for all-locations
   *
   * @param {object} req
   * @param {object} res
   */
  view: (req, res) => {
    locationService.get((err, locations) => {
      res.render("locations", {
        title: "Locations",
        locations: err ? [] : locations,
      });
    });
  },

  create: (req, res, next) => {
    try {
      locationService.create(req.body, (err, location, code = 400) => {
        if (err) {
          res.status(code).json({ status: false, message: err.message });
          return;
        }

        res.status(code).json({
          status: true,
          data: location,
          message: "Location successfully created",
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
