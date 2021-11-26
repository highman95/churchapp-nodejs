const organizationController = require("../../controllers/organization");

module.exports = (router) => {
  router
    .route("/api/v1/organizations")
    .post(organizationController.create)
    .get(organizationController.get);
};
