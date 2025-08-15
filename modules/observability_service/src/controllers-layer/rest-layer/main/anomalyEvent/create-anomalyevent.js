const { CreateAnomalyEventManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class CreateAnomalyEventRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("createAnomalyEvent", "createanomalyevent", req, res);
    this.dataName = "anomalyEvent";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateAnomalyEventManager(this._req, "rest");
  }
}

const createAnomalyEvent = async (req, res, next) => {
  const createAnomalyEventRestController = new CreateAnomalyEventRestController(
    req,
    res,
  );
  try {
    await createAnomalyEventRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createAnomalyEvent;
