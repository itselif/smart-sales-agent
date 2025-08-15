const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const PlatformAdminServiceManager = require("../../service-manager/PlatformAdminServiceManager");

/* Base Class For the Crud Routes Of DbObject OpenApiSchema */
class OpenApiSchemaManager extends PlatformAdminServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "openApiSchema";
    this.modelName = "OpenApiSchema";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = OpenApiSchemaManager;
