const { DeleteOpenApiSchemaManager } = require("managers");

const PlatformAdminRestController = require("../../PlatformAdminServiceRestController");

class DeleteOpenApiSchemaRestController extends PlatformAdminRestController {
  constructor(req, res) {
    super("deleteOpenApiSchema", "deleteopenapischema", req, res);
    this.dataName = "openApiSchema";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteOpenApiSchemaManager(this._req, "rest");
  }
}

const deleteOpenApiSchema = async (req, res, next) => {
  const deleteOpenApiSchemaRestController =
    new DeleteOpenApiSchemaRestController(req, res);
  try {
    await deleteOpenApiSchemaRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteOpenApiSchema;
