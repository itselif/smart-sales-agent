const { DeleteReportFileManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class DeleteReportFileRestController extends ReportingRestController {
  constructor(req, res) {
    super("deleteReportFile", "deletereportfile", req, res);
    this.dataName = "reportFile";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteReportFileManager(this._req, "rest");
  }
}

const deleteReportFile = async (req, res, next) => {
  const deleteReportFileRestController = new DeleteReportFileRestController(
    req,
    res,
  );
  try {
    await deleteReportFileRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteReportFile;
