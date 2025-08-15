const mainRouters = require("./main");
const sessionRouter = require("./session-router");
module.exports = {
  ...mainRouters,
  SalesManagementServiceRestController: require("./SalesManagementServiceRestController"),
  ...sessionRouter,
};
