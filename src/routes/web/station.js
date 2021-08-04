const stationsController = require("../../controllers/station");

module.exports = (router) => {
  router.get("/stations", stationsController.view); // view-all/one; add; edit
};
