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

class DbGetReportrequestCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, ReportRequest);
    this.commandName = "dbGetReportrequest";
    this.nullResult = false;
    this.objectName = "reportRequest";
    this.serviceLabel = "salesai-reporting-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (ReportRequest.getCqrsJoins) await ReportRequest.getCqrsJoins(data);
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

const dbGetReportrequest = (input) => {
  input.id = input.reportRequestId;
  const dbGetCommand = new DbGetReportrequestCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetReportrequest;
