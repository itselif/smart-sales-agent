const { CreateReportPolicyManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class CreateReportPolicyRestController extends ReportingRestController {
  constructor(req, res) {
    super("createReportPolicy", "createreportpolicy", req, res);
    this.dataName = "reportPolicy";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateReportPolicyManager(this._req, "rest");
  }
}

const createReportPolicy = async (req, res, next) => {
  const createReportPolicyRestController = new CreateReportPolicyRestController(
    req,
    res,
  );
  try {
    await createReportPolicyRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createReportPolicy;
