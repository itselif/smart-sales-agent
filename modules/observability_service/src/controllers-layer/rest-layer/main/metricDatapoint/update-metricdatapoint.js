const { UpdateMetricDatapointManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class UpdateMetricDatapointRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("updateMetricDatapoint", "updatemetricdatapoint", req, res);
    this.dataName = "metricDatapoint";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateMetricDatapointManager(this._req, "rest");
  }
}

const updateMetricDatapoint = async (req, res, next) => {
  const updateMetricDatapointRestController =
    new UpdateMetricDatapointRestController(req, res);
  try {
    await updateMetricDatapointRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateMetricDatapoint;
