const SalesManagementServiceMcpController = require("./SalesManagementServiceMcpController");

module.exports = (name, routeName, params) => {
  const mcpController = new SalesManagementServiceMcpController(
    name,
    routeName,
    params,
  );
  return mcpController;
};
