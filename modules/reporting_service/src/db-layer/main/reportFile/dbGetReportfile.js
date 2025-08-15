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

class DbGetReportfileCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, ReportFile);
    this.commandName = "dbGetReportfile";
    this.nullResult = false;
    this.objectName = "reportFile";
    this.serviceLabel = "salesai-reporting-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (ReportFile.getCqrsJoins) await ReportFile.getCqrsJoins(data);
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

const dbGetReportfile = (input) => {
  input.id = input.reportFileId;
  const dbGetCommand = new DbGetReportfileCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetReportfile;
