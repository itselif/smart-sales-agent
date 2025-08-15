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

const { ReportRequest, ReportFile, ReportPolicy } = require("models");

const { DBGetSequelizeCommand } = require("dbCommand");

class DbGetReportpolicyCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, ReportPolicy);
    this.commandName = "dbGetReportpolicy";
    this.nullResult = false;
    this.objectName = "reportPolicy";
    this.serviceLabel = "salesai-reporting-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (ReportPolicy.getCqrsJoins) await ReportPolicy.getCqrsJoins(data);
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

const dbGetReportpolicy = (input) => {
  input.id = input.reportPolicyId;
  const dbGetCommand = new DbGetReportpolicyCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetReportpolicy;
