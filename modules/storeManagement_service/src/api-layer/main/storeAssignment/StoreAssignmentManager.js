const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const StoreManagementServiceManager = require("../../service-manager/StoreManagementServiceManager");

/* Base Class For the Crud Routes Of DbObject StoreAssignment */
class StoreAssignmentManager extends StoreManagementServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "storeAssignment";
    this.modelName = "StoreAssignment";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = StoreAssignmentManager;
