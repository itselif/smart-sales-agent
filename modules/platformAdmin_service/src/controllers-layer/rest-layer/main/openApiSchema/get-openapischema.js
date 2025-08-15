const { GetOpenApiSchemaManager } = require("managers");

const PlatformAdminRestController = require("../../PlatformAdminServiceRestController");

class GetOpenApiSchemaRestController extends PlatformAdminRestController {
  constructor(req, res) {
    super("getOpenApiSchema", "getopenapischema", req, res);
    this.dataName = "openApiSchema";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetOpenApiSchemaManager(this._req, "rest");
  }
}

const getOpenApiSchema = async (req, res, next) => {
  const getOpenApiSchemaRestController = new GetOpenApiSchemaRestController(
    req,
    res,
  );
  try {
    await getOpenApiSchemaRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getOpenApiSchema;
