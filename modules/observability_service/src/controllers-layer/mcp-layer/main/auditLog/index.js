module.exports = (headers) => {
  // AuditLog Db Object Rest Api Router
  const auditLogMcpRouter = [];
  // getAuditLog controller
  auditLogMcpRouter.push(require("./get-auditlog")(headers));
  // createAuditLog controller
  auditLogMcpRouter.push(require("./create-auditlog")(headers));
  // updateAuditLog controller
  auditLogMcpRouter.push(require("./update-auditlog")(headers));
  // deleteAuditLog controller
  auditLogMcpRouter.push(require("./delete-auditlog")(headers));
  // listAuditLogs controller
  auditLogMcpRouter.push(require("./list-auditlogs")(headers));
  return auditLogMcpRouter;
};
