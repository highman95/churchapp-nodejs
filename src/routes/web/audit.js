const auditController = require('../../controllers/audit');

module.exports = (router) => {
  router.get('/audits', auditController.show);
  router.get('/audits/:id', auditController.describe);
};
