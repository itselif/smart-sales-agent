const StoreManagementServiceMcpController = require("./StoreManagementServiceMcpController");

module.exports = (name, routeName, params) => {
  const mcpController = new StoreManagementServiceMcpController(
    name,
    routeName,
    params,
  );
  return mcpController;
};
