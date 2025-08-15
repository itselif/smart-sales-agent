module.exports = (headers) => {
  // main Database Crud Object Mcp Api Routers
  return {
    auditLogMcpRouter: require("./auditLog")(headers),
    metricDatapointMcpRouter: require("./metricDatapoint")(headers),
    anomalyEventMcpRouter: require("./anomalyEvent")(headers),
  };
};
