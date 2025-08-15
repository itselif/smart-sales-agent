const { ListMetricDatapointsManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class ListMetricDatapointsRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("listMetricDatapoints", "listmetricdatapoints", req, res);
    this.dataName = "metricDatapoints";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListMetricDatapointsManager(this._req, "rest");
  }
}

const listMetricDatapoints = async (req, res, next) => {
  const listMetricDatapointsRestController =
    new ListMetricDatapointsRestController(req, res);
  try {
    await listMetricDatapointsRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listMetricDatapoints;
