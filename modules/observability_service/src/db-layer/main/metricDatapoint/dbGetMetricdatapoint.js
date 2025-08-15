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

class DbGetMetricdatapointCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, MetricDatapoint);
    this.commandName = "dbGetMetricdatapoint";
    this.nullResult = false;
    this.objectName = "metricDatapoint";
    this.serviceLabel = "salesai-observability-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (MetricDatapoint.getCqrsJoins) await MetricDatapoint.getCqrsJoins(data);
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

const dbGetMetricdatapoint = (input) => {
  input.id = input.metricDatapointId;
  const dbGetCommand = new DbGetMetricdatapointCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetMetricdatapoint;
