const { DeleteAuditLogManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class DeleteAuditLogRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("deleteAuditLog", "deleteauditlog", req, res);
    this.dataName = "auditLog";
    this.crudType = "delete";
    this.status = 200;
    this.httpMethod = "DELETE";
  }

  createApiManager() {
    return new DeleteAuditLogManager(this._req, "rest");
  }
}

const deleteAuditLog = async (req, res, next) => {
  const deleteAuditLogRestController = new DeleteAuditLogRestController(
    req,
    res,
  );
  try {
    await deleteAuditLogRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = deleteAuditLog;
