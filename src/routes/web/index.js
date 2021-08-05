const auditsRoutes = require("./audit");
const stationsRoutes = require("./station");
const meetingsRoutes = require("./meeting");
const usersRoutes = require("./user");
const organizationsRoutes = require("./organization");

module.exports = (router) => {
  auditsRoutes(router);
  stationsRoutes(router);
  meetingsRoutes(router);
  usersRoutes(router);
  organizationsRoutes(router);

  router.get("/", (req, res) => {
    res.render("index", { title: "Home" });
  });

  return router;
};
