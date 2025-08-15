const { DeleteMetricDatapointManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class DeleteMetricDatapointRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("deleteMetricDatapoint", "deletemetricdatapoint", req, res);
    this.dataName = "metricDatapoint";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteMetricDatapointManager(this._req, "rest");
  }
}

const deleteMetricDatapoint = async (req, res, next) => {
  const deleteMetricDatapointRestController =
    new DeleteMetricDatapointRestController(req, res);
  try {
    await deleteMetricDatapointRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteMetricDatapoint;
