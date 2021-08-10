const auditsRoutes = require("./audit");
const authRoutes = require("./auth");
const stationsRoutes = require("./station");
const meetingsRoutes = require("./meeting");
const usersRoutes = require("./user");
const organizationsRoutes = require("./organization");

module.exports = (router) => {
  auditsRoutes(router);
  authRoutes(router);
  stationsRoutes(router);
  meetingsRoutes(router);
  usersRoutes(router);
  organizationsRoutes(router);
  // return require("connect-ensure-login").ensureLoggedIn();

  router.get("/", (req, res) => {
    res.render("index", { title: "Home" });
  });

  return router;
};
