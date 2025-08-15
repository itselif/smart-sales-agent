const { GetAuditLogManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class GetAuditLogRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("getAuditLog", "getauditlog", req, res);
    this.dataName = "auditLog";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetAuditLogManager(this._req, "rest");
  }
}

const getAuditLog = async (req, res, next) => {
  const getAuditLogRestController = new GetAuditLogRestController(req, res);
  try {
    await getAuditLogRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getAuditLog;
