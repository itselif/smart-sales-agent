const { DeleteReportRequestManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class DeleteReportRequestRestController extends ReportingRestController {
  constructor(req, res) {
    super("deleteReportRequest", "deletereportrequest", req, res);
    this.dataName = "reportRequest";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteReportRequestManager(this._req, "rest");
  }
}

const deleteReportRequest = async (req, res, next) => {
  const deleteReportRequestRestController =
    new DeleteReportRequestRestController(req, res);
  try {
    await deleteReportRequestRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteReportRequest;
