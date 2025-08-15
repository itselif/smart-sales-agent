const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const ReportingServiceManager = require("../../service-manager/ReportingServiceManager");

/* Base Class For the Crud Routes Of DbObject ReportPolicy */
class ReportPolicyManager extends ReportingServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "reportPolicy";
    this.modelName = "ReportPolicy";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = ReportPolicyManager;
