const mainRouters = require("./main");
const sessionRouter = require("./session-router");
module.exports = {
  ...mainRouters,
  StoreManagementServiceRestController: require("./StoreManagementServiceRestController"),
  ...sessionRouter,
};
