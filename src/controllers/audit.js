const auditService = require('../services/audit');

module.exports = {
  get: (req, res, next) => {
    try {
      //
      res.json({ status: true, data: {name}, message: "Audit successfully fetched"});
    } catch (e) {
      next(e);
    }
  },

  show: (req, res) => {
    try {
      //
      res.render('', {audits: {}});
    } catch (e) {
    }
  },

  find: (req, res, next) => {
    const { name } = req.body;
    try {
      //
      res.json({ status: true, data: {name}, message: "Audit successfully found"});
    } catch (e) {
      next(e);
    }
  },

  describe: (req, res) => {
    try {
      //
      res.render('', {audit: {}});
    } catch (e) {
      res.redirect('/page404');
    }
  },
};
