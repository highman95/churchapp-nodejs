const statisticService = require("../services/statistic");

module.exports = {
  get: (req, res, next) => {
    try {
      statisticService.get(req.params.id, (err, stats) => {
        if (err) {
          res.status(400).json({ status: false, message: err.message });
          return;
        }

        res.json({
          status: true,
          data: stats,
          message: "Statistics successfully fetched",
        });
      });
    } catch (e) {
      next(e);
    }
  },

  create: (req, res, next) => {
    try {
      const {
        params: { id }, //meeting-id
        body: statistic,
      } = req;

      statisticService.create(id, statistic, (err, stat, code = 400) => {
        if (err) {
          return req.isWR
            ? res.redirect(`/meetings?err=${err.message}`)
            : res.status(code).json({ status: false, message: err.message });
        }

        return req.isWR
          ? res.redirect(`/meetings/${id}`)
          : res.status(code).json({
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
