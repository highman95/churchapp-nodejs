const auditService = require("../services/audit");

module.exports = {
  get: (req, res, next) => {
    try {
      auditService.get((err, audits, code = 400) => {
        res.status(code).json({
          status: !err,
          data: audits,
          message: "Audits successfully fetched",
        });
      });
    } catch (e) {
      next(e);
    }
  },

  show: (req, res) => {
    try {
      auditService.get((error, audits) => {
        res.render("audits", { title: "Audits", audits, error });
      });
    } catch (e) {}
  },

  find: (req, res, next) => {
    try {
      auditService.find(req.params.id, (err, audit, code = 400) => {
        return res.status(code).json({
          status: !err,
          data: audit,
          message: err ? err.message : "Audit successfully found",
        });
      });
    } catch (e) {
      next(e);
    }
  },

  describe: (req, res) => {
    try {
      auditService.find(req.params.id, (err, audit) => {
        return !!audit
          ? res.render("audits/view", { title: "Audits", audit })
          : res.redirect("/audits");
      });
    } catch (e) {}
  },
};
