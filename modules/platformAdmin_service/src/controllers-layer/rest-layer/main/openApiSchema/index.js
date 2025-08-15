const express = require("express");

// OpenApiSchema Db Object Rest Api Router
const openApiSchemaRouter = express.Router();

// add OpenApiSchema controllers

// getOpenApiSchema controller
openApiSchemaRouter.get(
  "/openapischemas/:openApiSchemaId",
  require("./get-openapischema"),
);
// createOpenApiSchema controller
openApiSchemaRouter.post("/openapischemas", require("./create-openapischema"));
// updateOpenApiSchema controller
openApiSchemaRouter.patch(
  "/openapischemas/:openApiSchemaId",
  require("./update-openapischema"),
);
// deleteOpenApiSchema controller
openApiSchemaRouter.delete(
  "/openapischemas/:openApiSchemaId",
  require("./delete-openapischema"),
);
// listOpenApiSchemas controller
openApiSchemaRouter.get("/openapischemas", require("./list-openapischemas"));

module.exports = openApiSchemaRouter;
