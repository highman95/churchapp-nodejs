const locationController = require("../../controllers/location");

module.exports = (router) => {
  router.get("/api/v1/locations", locationController.get);
  router.post("/api/v1/locations", locationController.create);
};
