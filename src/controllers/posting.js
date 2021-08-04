const postingService = require("../services/posting");

module.exports = {
  create: (req, res, next) => {
    try {
      postingService.create(
        { user_id: req.params.id, ...req.body },
        (err, posting, code = 400) => {
          res.status(code).json({
            status: !err,
            data: posting,
            message: err ? err.message : "Posting successfully saved",
          });
        }
      );
    } catch (e) {
      next(e);
    }
  },

  get: (req, res, next) => {
    try {
      postingService.get(req.params.id, (err, postings, code = 400) => {
        res.status(code).json({
          status: !err,
          data: postings,
          message: err ? err.message : "Postings successfully fetched",
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
