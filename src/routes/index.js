const webRoutes = require("./web");
const apiRoutes = require("./api");

module.exports = (router) => {
  apiRoutes(router);
  webRoutes(router);

  return router;
};
