module.exports = (headers) => {
  // main Database Crud Object Mcp Api Routers
  return {
    reportRequestMcpRouter: require("./reportRequest")(headers),
    reportFileMcpRouter: require("./reportFile")(headers),
    reportPolicyMcpRouter: require("./reportPolicy")(headers),
  };
};
