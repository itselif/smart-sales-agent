const { ListAnomalyEventsManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class ListAnomalyEventsRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("listAnomalyEvents", "listanomalyevents", req, res);
    this.dataName = "anomalyEvents";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListAnomalyEventsManager(this._req, "rest");
  }
}

const listAnomalyEvents = async (req, res, next) => {
  const listAnomalyEventsRestController = new ListAnomalyEventsRestController(
    req,
    res,
  );
  try {
    await listAnomalyEventsRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listAnomalyEvents;
