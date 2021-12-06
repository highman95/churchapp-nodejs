const { ensureLoggedIn } = require("connect-ensure-login");
const auditController = require("../../controllers/audit");

module.exports = (router) => {
  router.get("/audits", ensureLoggedIn(), auditController.show);
  router.get("/audits/:id", ensureLoggedIn(), auditController.describe);
};
