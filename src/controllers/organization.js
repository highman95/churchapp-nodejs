const organizationService = require("../services/organization");

module.exports = {
  create: (req, res, next) => {
    try {
      organizationService.create(req.body, (err, organization, code = 400) => {
        res.status(code).json({
          status: !err,
          data: organization,
          message: err ? err.message : "Organization successfully saved",
        });
      });
    } catch (e) {
      next(e);
    }
  },

  get: (req, res, next) => {
    try {
      organizationService.get((err, organizations, code = 400) => {
        res.status(code).json({
          status: !err,
          data: organizations,
          message: err ? err.message : "Organizations successfully fetched",
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
