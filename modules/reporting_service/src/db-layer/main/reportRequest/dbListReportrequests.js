const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { ReportRequest, ReportFile, ReportPolicy } = require("models");

class DbListReportrequestsCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListReportrequests";
    this.emptyResult = true;
    this.objectName = "reportRequests";
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
    for (const reportRequest of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (ReportRequest.getCqrsJoins) {
      await ReportRequest.getCqrsJoins(item);
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

    let reportRequests = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    reportRequests = await ReportRequest.findAll(options);

    return reportRequests;
  }
}

const dbListReportrequests = (input) => {
  const dbGetListCommand = new DbListReportrequestsCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListReportrequests;
