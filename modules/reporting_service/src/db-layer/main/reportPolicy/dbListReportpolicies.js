const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { ReportRequest, ReportFile, ReportPolicy } = require("models");

class DbListReportpoliciesCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListReportpolicies";
    this.emptyResult = true;
    this.objectName = "reportPolicies";
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
    for (const reportPolicy of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (ReportPolicy.getCqrsJoins) {
      await ReportPolicy.getCqrsJoins(item);
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

    let reportPolicys = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    reportPolicys = await ReportPolicy.findAll(options);

    return reportPolicys;
  }
}

const dbListReportpolicies = (input) => {
  const dbGetListCommand = new DbListReportpoliciesCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListReportpolicies;
