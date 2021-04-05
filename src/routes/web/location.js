const locationsController = require("../../controllers/location");

module.exports = (router) => {
  router.get("/locations", locationsController.view); // view-all/one; add; edit
};
