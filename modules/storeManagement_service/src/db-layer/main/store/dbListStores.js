const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { Store, StoreAssignment } = require("models");

class DbListStoresCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListStores";
    this.emptyResult = true;
    this.objectName = "stores";
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
    for (const store of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (Store.getCqrsJoins) {
      await Store.getCqrsJoins(item);
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

    let stores = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    stores = await Store.findAll(options);

    return stores;
  }
}

const dbListStores = (input) => {
  const dbGetListCommand = new DbListStoresCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListStores;
