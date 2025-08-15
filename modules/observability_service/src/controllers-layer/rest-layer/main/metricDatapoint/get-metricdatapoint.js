const { GetMetricDatapointManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class GetMetricDatapointRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("getMetricDatapoint", "getmetricdatapoint", req, res);
    this.dataName = "metricDatapoint";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetMetricDatapointManager(this._req, "rest");
  }
}

const getMetricDatapoint = async (req, res, next) => {
  const getMetricDatapointRestController = new GetMetricDatapointRestController(
    req,
    res,
  );
  try {
    await getMetricDatapointRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getMetricDatapoint;
