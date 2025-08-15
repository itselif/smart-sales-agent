const mainRouters = require("./main");
const sessionRouter = require("./session-router");
module.exports = {
  ...mainRouters,
  InventoryManagementServiceRestController: require("./InventoryManagementServiceRestController"),
  ...sessionRouter,
};
