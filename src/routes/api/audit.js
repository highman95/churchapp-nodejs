const auditController = require('../../controllers/audit');

module.exports = (router) => {
  router.get('/audits', auditController.get);
  router.get('/audits/:id', auditController.find);
};
