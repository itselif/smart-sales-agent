const { UpdateReportFileManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class UpdateReportFileRestController extends ReportingRestController {
  constructor(req, res) {
    super("updateReportFile", "updatereportfile", req, res);
    this.dataName = "reportFile";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateReportFileManager(this._req, "rest");
  }
}

const updateReportFile = async (req, res, next) => {
  const updateReportFileRestController = new UpdateReportFileRestController(
    req,
    res,
  );
  try {
    await updateReportFileRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateReportFile;
