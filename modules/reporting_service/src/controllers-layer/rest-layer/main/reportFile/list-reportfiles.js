const { ListReportFilesManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class ListReportFilesRestController extends ReportingRestController {
  constructor(req, res) {
    super("listReportFiles", "listreportfiles", req, res);
    this.dataName = "reportFiles";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListReportFilesManager(this._req, "rest");
  }
}

const listReportFiles = async (req, res, next) => {
  const listReportFilesRestController = new ListReportFilesRestController(
    req,
    res,
  );
  try {
    await listReportFilesRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listReportFiles;
