const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const SalesManagementServiceManager = require("../../service-manager/SalesManagementServiceManager");

/* Base Class For the Crud Routes Of DbObject SaleTransaction */
class SaleTransactionManager extends SalesManagementServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "saleTransaction";
    this.modelName = "SaleTransaction";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = SaleTransactionManager;
