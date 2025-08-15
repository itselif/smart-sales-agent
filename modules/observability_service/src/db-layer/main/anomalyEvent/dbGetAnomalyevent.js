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

class DbGetAnomalyeventCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, AnomalyEvent);
    this.commandName = "dbGetAnomalyevent";
    this.nullResult = false;
    this.objectName = "anomalyEvent";
    this.serviceLabel = "salesai-observability-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (AnomalyEvent.getCqrsJoins) await AnomalyEvent.getCqrsJoins(data);
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

const dbGetAnomalyevent = (input) => {
  input.id = input.anomalyEventId;
  const dbGetCommand = new DbGetAnomalyeventCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetAnomalyevent;
