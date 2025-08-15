const { ListReportPoliciesManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class ListReportPoliciesRestController extends ReportingRestController {
  constructor(req, res) {
    super("listReportPolicies", "listreportpolicies", req, res);
    this.dataName = "reportPolicies";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListReportPoliciesManager(this._req, "rest");
  }
}

const listReportPolicies = async (req, res, next) => {
  const listReportPoliciesRestController = new ListReportPoliciesRestController(
    req,
    res,
  );
  try {
    await listReportPoliciesRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listReportPolicies;
