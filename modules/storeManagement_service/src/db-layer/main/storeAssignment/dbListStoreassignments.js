const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { Store, StoreAssignment } = require("models");

class DbListStoreassignmentsCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListStoreassignments";
    this.emptyResult = true;
    this.objectName = "storeAssignments";
    this.serviceLabel = "salesai-storemanagement-service";
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
    for (const storeAssignment of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (StoreAssignment.getCqrsJoins) {
      await StoreAssignment.getCqrsJoins(item);
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

    let storeAssignments = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    storeAssignments = await StoreAssignment.findAll(options);

    return storeAssignments;
  }
}

const dbListStoreassignments = (input) => {
  const dbGetListCommand = new DbListStoreassignmentsCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListStoreassignments;
