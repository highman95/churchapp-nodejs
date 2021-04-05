const webRoutes = require("./web");
const apiRoutes = require("./api");

module.exports = (router) => {
  webRoutes(router);
  apiRoutes(router);

  return router;
};
