const ReportingServiceMcpController = require("./ReportingServiceMcpController");

module.exports = (name, routeName, params) => {
  const mcpController = new ReportingServiceMcpController(
    name,
    routeName,
    params,
  );
  return mcpController;
};
