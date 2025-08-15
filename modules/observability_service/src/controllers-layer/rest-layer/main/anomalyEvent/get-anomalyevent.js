const { GetAnomalyEventManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class GetAnomalyEventRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("getAnomalyEvent", "getanomalyevent", req, res);
    this.dataName = "anomalyEvent";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetAnomalyEventManager(this._req, "rest");
  }
}

const getAnomalyEvent = async (req, res, next) => {
  const getAnomalyEventRestController = new GetAnomalyEventRestController(
    req,
    res,
  );
  try {
    await getAnomalyEventRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getAnomalyEvent;
