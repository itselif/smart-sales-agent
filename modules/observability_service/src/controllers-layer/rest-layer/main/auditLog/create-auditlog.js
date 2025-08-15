const { CreateAuditLogManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class CreateAuditLogRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("createAuditLog", "createauditlog", req, res);
    this.dataName = "auditLog";
    this.crudType = "create";
    this.status = 201;
    this.httpMethod = "POST";
  }

  createApiManager() {
    return new CreateAuditLogManager(this._req, "rest");
  }
}

const createAuditLog = async (req, res, next) => {
  const createAuditLogRestController = new CreateAuditLogRestController(
    req,
    res,
  );
  try {
    await createAuditLogRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = createAuditLog;
