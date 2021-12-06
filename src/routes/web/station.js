const { ensureLoggedIn } = require("connect-ensure-login");
const stationsController = require("../../controllers/station");

module.exports = (router) => {
  router.get("/stations", ensureLoggedIn(), stationsController.view); // view-all/one; add; edit
};
