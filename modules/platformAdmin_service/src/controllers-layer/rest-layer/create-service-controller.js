const PlatformAdminServiceRestController = require("./PlatformAdminServiceRestController");

module.exports = (name, routeName, req, res) => {
  const restController = new PlatformAdminServiceRestController(
    name,
    routeName,
    req,
    res,
  );
  return restController;
};
