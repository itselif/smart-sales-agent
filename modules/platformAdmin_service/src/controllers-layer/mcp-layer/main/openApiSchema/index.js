module.exports = (headers) => {
  // OpenApiSchema Db Object Rest Api Router
  const openApiSchemaMcpRouter = [];
  // getOpenApiSchema controller
  openApiSchemaMcpRouter.push(require("./get-openapischema")(headers));
  // createOpenApiSchema controller
  openApiSchemaMcpRouter.push(require("./create-openapischema")(headers));
  // updateOpenApiSchema controller
  openApiSchemaMcpRouter.push(require("./update-openapischema")(headers));
  // deleteOpenApiSchema controller
  openApiSchemaMcpRouter.push(require("./delete-openapischema")(headers));
  // listOpenApiSchemas controller
  openApiSchemaMcpRouter.push(require("./list-openapischemas")(headers));
  return openApiSchemaMcpRouter;
};
