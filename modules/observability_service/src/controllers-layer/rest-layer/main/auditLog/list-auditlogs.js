const { ListAuditLogsManager } = require("managers");

const ObservabilityRestController = require("../../ObservabilityServiceRestController");

class ListAuditLogsRestController extends ObservabilityRestController {
  constructor(req, res) {
    super("listAuditLogs", "listauditlogs", req, res);
    this.dataName = "auditLogs";
    this.crudType = "getList";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new ListAuditLogsManager(this._req, "rest");
  }
}

const listAuditLogs = async (req, res, next) => {
  const listAuditLogsRestController = new ListAuditLogsRestController(req, res);
  try {
    await listAuditLogsRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = listAuditLogs;
