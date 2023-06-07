const auditsRoutes = require("./audit");
const authRoutes = require("./auth");
const stationsRoutes = require("./station");
const meetingsRoutes = require("./meeting");
const usersRoutes = require("./user");
const organizationsRoutes = require("./organization");
const reportRoutes = require("./report");

const graphqlRoute = require("./graphql");

module.exports = (router) => {
  auditsRoutes(router);
  authRoutes(router);
  stationsRoutes(router);
  meetingsRoutes(router);
  usersRoutes(router);
  organizationsRoutes(router);
  reportRoutes(router);

  graphqlRoute(router);

  router.get("/api/v1/ping", (_req, res) => {
    res.json({ status: true, message: "It's all good..." });
  });

  return router;
};
