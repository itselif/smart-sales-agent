const { sequelize } = require("common");
const { Op } = require("sequelize");
const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");

const { AuditLog, MetricDatapoint, AnomalyEvent } = require("models");

const { DBGetSequelizeCommand } = require("dbCommand");

class DbGetAuditlogCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, AuditLog);
    this.commandName = "dbGetAuditlog";
    this.nullResult = false;
    this.objectName = "auditLog";
    this.serviceLabel = "salesai-observability-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (AuditLog.getCqrsJoins) await AuditLog.getCqrsJoins(data);
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async checkEntityOwnership(entity) {
    return true;
  }

  async transposeResult() {
    // transpose dbData
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }
}

const dbGetAuditlog = (input) => {
  input.id = input.auditLogId;
  const dbGetCommand = new DbGetAuditlogCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetAuditlog;
