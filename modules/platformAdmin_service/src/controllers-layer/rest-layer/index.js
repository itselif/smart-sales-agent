const mainRouters = require("./main");
const sessionRouter = require("./session-router");
module.exports = {
  ...mainRouters,
  PlatformAdminServiceRestController: require("./PlatformAdminServiceRestController"),
  ...sessionRouter,
};
