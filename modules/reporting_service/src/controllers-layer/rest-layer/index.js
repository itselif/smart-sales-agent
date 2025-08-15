const mainRouters = require("./main");
const sessionRouter = require("./session-router");
module.exports = {
  ...mainRouters,
  ReportingServiceRestController: require("./ReportingServiceRestController"),
  ...sessionRouter,
};
