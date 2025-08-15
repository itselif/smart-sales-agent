const ObservabilityServiceMcpController = require("./ObservabilityServiceMcpController");

module.exports = (name, routeName, params) => {
  const mcpController = new ObservabilityServiceMcpController(
    name,
    routeName,
    params,
  );
  return mcpController;
};
