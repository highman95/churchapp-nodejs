const auditsRoutes = require("./audit");
const stationsRoutes = require("./station");
const meetingsRoutes = require("./meeting");
const usersRoutes = require("./user");

module.exports = (router) => {
  auditsRoutes(router);
  stationsRoutes(router);
  meetingsRoutes(router);
  usersRoutes(router);

  router.get("/", (req, res) => {
    res.render("index", { title: "Home" });
  });
};
