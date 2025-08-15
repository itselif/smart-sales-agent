const mainRouters = require("./main");
const sessionRouter = require("./session-router");
module.exports = {
  ...mainRouters,
  ObservabilityServiceRestController: require("./ObservabilityServiceRestController"),
  ...sessionRouter,
};
