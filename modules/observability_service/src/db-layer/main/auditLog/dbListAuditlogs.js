const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { AuditLog, MetricDatapoint, AnomalyEvent } = require("models");

class DbListAuditlogsCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListAuditlogs";
    this.emptyResult = true;
    this.objectName = "auditLogs";
    this.serviceLabel = "salesai-observability-service";
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
    for (const auditLog of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (AuditLog.getCqrsJoins) {
      await AuditLog.getCqrsJoins(item);
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

    let auditLogs = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    auditLogs = await AuditLog.findAll(options);

    return auditLogs;
  }
}

const dbListAuditlogs = (input) => {
  const dbGetListCommand = new DbListAuditlogsCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListAuditlogs;
