const { GetReportFileManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class GetReportFileRestController extends ReportingRestController {
  constructor(req, res) {
    super("getReportFile", "getreportfile", req, res);
    this.dataName = "reportFile";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetReportFileManager(this._req, "rest");
  }
}

const getReportFile = async (req, res, next) => {
  const getReportFileRestController = new GetReportFileRestController(req, res);
  try {
    await getReportFileRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getReportFile;
