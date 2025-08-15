const { ListOpenApiSchemasManager } = require("managers");

const PlatformAdminRestController = require("../../PlatformAdminServiceRestController");

class ListOpenApiSchemasRestController extends PlatformAdminRestController {
  constructor(req, res) {
    super("listOpenApiSchemas", "listopenapischemas", req, res);
    this.dataName = "openApiSchemas";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListOpenApiSchemasManager(this._req, "rest");
  }
}

const listOpenApiSchemas = async (req, res, next) => {
  const listOpenApiSchemasRestController = new ListOpenApiSchemasRestController(
    req,
    res,
  );
  try {
    await listOpenApiSchemasRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listOpenApiSchemas;
