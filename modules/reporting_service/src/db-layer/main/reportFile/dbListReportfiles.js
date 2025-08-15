const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { ReportRequest, ReportFile, ReportPolicy } = require("models");

class DbListReportfilesCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListReportfiles";
    this.emptyResult = true;
    this.objectName = "reportFiles";
    this.serviceLabel = "salesai-reporting-service";
    this.input.pagination = null;
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  // should i add this here?

  // ask about this should i rename the whereClause to dataClause???

  async transposeResult() {
    for (const reportFile of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (ReportFile.getCqrsJoins) {
      await ReportFile.getCqrsJoins(item);
    }
  }

  async executeQuery() {
    const input = this.input;
    let options = { where: this.whereClause };
    if (input.sortBy) options.order = input.sortBy ?? [["id", "ASC"]];

    options.include = this.buildIncludes();
    if (options.include && options.include.length == 0) options.include = null;

    if (!input.getJoins) {
      options.include = null;
    }

    let reportFiles = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    reportFiles = await ReportFile.findAll(options);

    return reportFiles;
  }
}

const dbListReportfiles = (input) => {
  const dbGetListCommand = new DbListReportfilesCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListReportfiles;
