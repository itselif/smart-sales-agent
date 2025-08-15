module.exports = (headers) => {
  // main Database Crud Object Mcp Api Routers
  return {
    openApiSchemaMcpRouter: require("./openApiSchema")(headers),
  };
};
