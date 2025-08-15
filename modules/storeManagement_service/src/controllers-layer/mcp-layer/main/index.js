module.exports = (headers) => {
  // main Database Crud Object Mcp Api Routers
  return {
    storeMcpRouter: require("./store")(headers),
    storeAssignmentMcpRouter: require("./storeAssignment")(headers),
  };
};
