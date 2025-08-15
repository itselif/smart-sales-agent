const { UpdateAnomalyEventManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class UpdateAnomalyEventRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("updateAnomalyEvent", "updateanomalyevent", req, res);
    this.dataName = "anomalyEvent";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateAnomalyEventManager(this._req, "rest");
  }
}

const updateAnomalyEvent = async (req, res, next) => {
  const updateAnomalyEventRestController = new UpdateAnomalyEventRestController(
    req,
    res,
  );
  try {
    await updateAnomalyEventRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateAnomalyEvent;
