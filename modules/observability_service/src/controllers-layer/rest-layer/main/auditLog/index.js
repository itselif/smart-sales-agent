const express = require("express");

// AuditLog Db Object Rest Api Router
const auditLogRouter = express.Router();

// add AuditLog controllers

// getAuditLog controller
auditLogRouter.get("/auditlogs/:auditLogId", require("./get-auditlog"));
// createAuditLog controller
auditLogRouter.post("/auditlogs", require("./create-auditlog"));
// updateAuditLog controller
auditLogRouter.patch("/auditlogs/:auditLogId", require("./update-auditlog"));
// deleteAuditLog controller
auditLogRouter.delete("/auditlogs/:auditLogId", require("./delete-auditlog"));
// listAuditLogs controller
auditLogRouter.get("/auditlogs", require("./list-auditlogs"));

module.exports = auditLogRouter;
