const InventoryManagementServiceMcpController = require("./InventoryManagementServiceMcpController");

module.exports = (name, routeName, params) => {
  const mcpController = new InventoryManagementServiceMcpController(
    name,
    routeName,
    params,
  );
  return mcpController;
};
