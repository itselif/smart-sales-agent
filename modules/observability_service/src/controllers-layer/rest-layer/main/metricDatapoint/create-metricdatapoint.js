const { CreateMetricDatapointManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class CreateMetricDatapointRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("createMetricDatapoint", "createmetricdatapoint", req, res);
    this.dataName = "metricDatapoint";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateMetricDatapointManager(this._req, "rest");
  }
}

const createMetricDatapoint = async (req, res, next) => {
  const createMetricDatapointRestController =
    new CreateMetricDatapointRestController(req, res);
  try {
    await createMetricDatapointRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createMetricDatapoint;
