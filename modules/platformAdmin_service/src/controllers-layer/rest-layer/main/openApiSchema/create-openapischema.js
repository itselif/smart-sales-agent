const { CreateOpenApiSchemaManager } = require("managers");

const PlatformAdminRestController = require("../../PlatformAdminServiceRestController");

class CreateOpenApiSchemaRestController extends PlatformAdminRestController {
  constructor(req, res) {
    super("createOpenApiSchema", "createopenapischema", req, res);
    this.dataName = "openApiSchema";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateOpenApiSchemaManager(this._req, "rest");
  }
}

const createOpenApiSchema = async (req, res, next) => {
  const createOpenApiSchemaRestController =
    new CreateOpenApiSchemaRestController(req, res);
  try {
    await createOpenApiSchemaRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createOpenApiSchema;
