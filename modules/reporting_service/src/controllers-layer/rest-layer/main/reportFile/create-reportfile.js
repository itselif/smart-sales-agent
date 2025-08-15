const { CreateReportFileManager } = require("managers");

const ReportingRestController = require("../../ReportingServiceRestController");

class CreateReportFileRestController extends ReportingRestController {
  constructor(req, res) {
    super("createReportFile", "createreportfile", req, res);
    this.dataName = "reportFile";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateReportFileManager(this._req, "rest");
  }
}

const createReportFile = async (req, res, next) => {
  const createReportFileRestController = new CreateReportFileRestController(
    req,
    res,
  );
  try {
    await createReportFileRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createReportFile;
