const statisticService = require("../services/statistic");

module.exports = {
  create: (req, res, next) => {
    try {
      const {
        params: { id },
        body: statistic,
      } = req;

      statisticService.create(id, statistic, (err, stat, code = 400) => {
        if (err) {
          res.status(code).json({ status: false, message: err.message });
          return;
        }

        res.status(code).json({
          status: true,
          data: stat,
          message: "Statistics successfully saved",
        });
      });
    } catch (e) {
      next(e);
    }
  },

  update: (req, res, next) => {
    try {
      const {
        params: { id, sid },
        body: statistic,
      } = req;

      statisticService.update(id, sid, statistic, (err, stat, code = 400) => {
        return res.status(code).json({
          status: !!err,
          stat,
          message: err ? err.message : "Statistics successfully updated",
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
