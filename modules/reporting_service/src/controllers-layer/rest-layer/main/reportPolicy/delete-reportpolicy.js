const { DeleteReportPolicyManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class DeleteReportPolicyRestController extends ReportingRestController {
  constructor(req, res) {
    super("deleteReportPolicy", "deletereportpolicy", req, res);
    this.dataName = "reportPolicy";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteReportPolicyManager(this._req, "rest");
  }
}

const deleteReportPolicy = async (req, res, next) => {
  const deleteReportPolicyRestController = new DeleteReportPolicyRestController(
    req,
    res,
  );
  try {
    await deleteReportPolicyRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteReportPolicy;
