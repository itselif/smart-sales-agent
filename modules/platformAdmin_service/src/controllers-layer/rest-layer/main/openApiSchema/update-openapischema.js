const { UpdateOpenApiSchemaManager } = require("managers");

const PlatformAdminRestController = require("../../PlatformAdminServiceRestController");

class UpdateOpenApiSchemaRestController extends PlatformAdminRestController {
  constructor(req, res) {
    super("updateOpenApiSchema", "updateopenapischema", req, res);
    this.dataName = "openApiSchema";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateOpenApiSchemaManager(this._req, "rest");
  }
}

const updateOpenApiSchema = async (req, res, next) => {
  const updateOpenApiSchemaRestController =
    new UpdateOpenApiSchemaRestController(req, res);
  try {
    await updateOpenApiSchemaRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateOpenApiSchema;
