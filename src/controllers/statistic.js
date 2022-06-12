const statisticService = require("../services/statistic");

module.exports = {
  get: (req, res, next) => {
    const {
      params: { id },
      isWR,
    } = req;

    try {
      statisticService.get(id, (err, stats, code = 400) => {
        return isWR
          ? res.redirect(`/meetings/${id}`)
          : res.status(code).json({
              status: !err,
              data: stats,
              message: err ? err.message : "Statistics successfully fetched",
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
        isWR,
      } = req;

      statisticService.create(id, statistic, (err, stat, code = 400) => {
        if (err) {
          return isWR
            ? res.redirect(`/meetings?err=${err.message}`)
            : res.status(code).json({ status: false, message: err.message });
        }

        return isWR
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
        isWR,
      } = req;

      statisticService.update(id, sid, statistic, (err, stat, code = 400) => {
        if (err) {
          return isWR
            ? res.redirect(`/meetings?err=${err.message}`)
            : res.status(code).json({ status: false, message: err.message });
        }

        return isWR
          ? res.redirect(`/meetings/${id}`)
          : res.status(code).json({
              status: !err,
              data: stat,
              message: "Statistics successfully updated",
            });
      });
    } catch (e) {
      next(e);
    }
  },
};
