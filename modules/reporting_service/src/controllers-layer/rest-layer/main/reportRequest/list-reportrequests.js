const { ListReportRequestsManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class ListReportRequestsRestController extends ReportingRestController {
  constructor(req, res) {
    super("listReportRequests", "listreportrequests", req, res);
    this.dataName = "reportRequests";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListReportRequestsManager(this._req, "rest");
  }
}

const listReportRequests = async (req, res, next) => {
  const listReportRequestsRestController = new ListReportRequestsRestController(
    req,
    res,
  );
  try {
    await listReportRequestsRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listReportRequests;
