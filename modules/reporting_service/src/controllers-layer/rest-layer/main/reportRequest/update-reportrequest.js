const { UpdateReportRequestManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class UpdateReportRequestRestController extends ReportingRestController {
  constructor(req, res) {
    super("updateReportRequest", "updatereportrequest", req, res);
    this.dataName = "reportRequest";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateReportRequestManager(this._req, "rest");
  }
}

const updateReportRequest = async (req, res, next) => {
  const updateReportRequestRestController =
    new UpdateReportRequestRestController(req, res);
  try {
    await updateReportRequestRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateReportRequest;
