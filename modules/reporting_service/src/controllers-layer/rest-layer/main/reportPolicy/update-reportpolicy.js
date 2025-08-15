const { UpdateReportPolicyManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class UpdateReportPolicyRestController extends ReportingRestController {
  constructor(req, res) {
    super("updateReportPolicy", "updatereportpolicy", req, res);
    this.dataName = "reportPolicy";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateReportPolicyManager(this._req, "rest");
  }
}

const updateReportPolicy = async (req, res, next) => {
  const updateReportPolicyRestController = new UpdateReportPolicyRestController(
    req,
    res,
  );
  try {
    await updateReportPolicyRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateReportPolicy;
