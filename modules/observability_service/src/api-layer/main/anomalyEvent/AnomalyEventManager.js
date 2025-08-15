const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const ObservabilityServiceManager = require("../../service-manager/ObservabilityServiceManager");

/* Base Class For the Crud Routes Of DbObject AnomalyEvent */
class AnomalyEventManager extends ObservabilityServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "anomalyEvent";
    this.modelName = "AnomalyEvent";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = AnomalyEventManager;
