const auditsRoutes = require("./audit");
const locationsRoutes = require("./location");
const meetingsRoutes = require("./meeting");
const usersRoutes = require("./user");

module.exports = (router) => {
  auditsRoutes(router);
  locationsRoutes(router);
  meetingsRoutes(router);
  usersRoutes(router);

  router.get("/api/v1/ping", (req, res) => {
    res.json({ status: true, message: "It's all good..." });
  });
};
