const { GetReportPolicyManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class GetReportPolicyRestController extends ReportingRestController {
  constructor(req, res) {
    super("getReportPolicy", "getreportpolicy", req, res);
    this.dataName = "reportPolicy";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetReportPolicyManager(this._req, "rest");
  }
}

const getReportPolicy = async (req, res, next) => {
  const getReportPolicyRestController = new GetReportPolicyRestController(
    req,
    res,
  );
  try {
    await getReportPolicyRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getReportPolicy;
