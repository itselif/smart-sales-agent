const { GetReportRequestManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class GetReportRequestRestController extends ReportingRestController {
  constructor(req, res) {
    super("getReportRequest", "getreportrequest", req, res);
    this.dataName = "reportRequest";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetReportRequestManager(this._req, "rest");
  }
}

const getReportRequest = async (req, res, next) => {
  const getReportRequestRestController = new GetReportRequestRestController(
    req,
    res,
  );
  try {
    await getReportRequestRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getReportRequest;
