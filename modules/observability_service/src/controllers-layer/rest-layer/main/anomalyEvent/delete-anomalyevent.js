const { DeleteAnomalyEventManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class DeleteAnomalyEventRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("deleteAnomalyEvent", "deleteanomalyevent", req, res);
    this.dataName = "anomalyEvent";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteAnomalyEventManager(this._req, "rest");
  }
}

const deleteAnomalyEvent = async (req, res, next) => {
  const deleteAnomalyEventRestController = new DeleteAnomalyEventRestController(
    req,
    res,
  );
  try {
    await deleteAnomalyEventRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteAnomalyEvent;
