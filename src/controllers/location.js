const locationService = require("../services/location");

module.exports = {
  get: (req, res, next) => {
    try {
      locationService.get((err, result) => {
        if (err) {
          res.status(400).json({
            status: false,
            message: err.message,
          });
          return;
        }

        res.json({
          status: true,
          data: result,
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
    const locations = locationService.get((err, locations) => {
      res.render("locations", {
        title: "Locations",
        locations: err ? [] : locations,
      });
    });
  },

  create: (req, res, next) => {
    const { name } = req.body;

    try {
      locationService.create(name, (err, result) => {
        if (err) {
          res.status(400).json({
            status: false,
            message: err.message,
          });
          return;
        }

        res.status(201).json({
          status: true,
          data: { name },
          message: "Location successfully created",
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
