const { CreateReportRequestManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class CreateReportRequestRestController extends ReportingRestController {
  constructor(req, res) {
    super("createReportRequest", "createreportrequest", req, res);
    this.dataName = "reportRequest";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateReportRequestManager(this._req, "rest");
  }
}

const createReportRequest = async (req, res, next) => {
  const createReportRequestRestController =
    new CreateReportRequestRestController(req, res);
  try {
    await createReportRequestRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createReportRequest;
