const PlatformAdminServiceMcpController = require("./PlatformAdminServiceMcpController");

module.exports = (name, routeName, params) => {
  const mcpController = new PlatformAdminServiceMcpController(
    name,
    routeName,
    params,
  );
  return mcpController;
};
