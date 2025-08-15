const { UpdateAuditLogManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class UpdateAuditLogRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("updateAuditLog", "updateauditlog", req, res);
    this.dataName = "auditLog";
    this.crudType = "update";
    this.status = 200;
    this.httpMethod = "PATCH";
  }

  createApiManager() {
    return new UpdateAuditLogManager(this._req, "rest");
  }
}

const updateAuditLog = async (req, res, next) => {
  const updateAuditLogRestController = new UpdateAuditLogRestController(
    req,
    res,
  );
  try {
    await updateAuditLogRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = updateAuditLog;
