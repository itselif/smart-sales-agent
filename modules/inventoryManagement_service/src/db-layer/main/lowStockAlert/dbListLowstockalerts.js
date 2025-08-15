const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { InventoryItem, InventoryMovement, LowStockAlert } = require("models");

class DbListLowstockalertsCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListLowstockalerts";
    this.emptyResult = true;
    this.objectName = "lowStockAlerts";
    this.serviceLabel = "salesai-inventorymanagement-service";
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
    for (const lowStockAlert of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (LowStockAlert.getCqrsJoins) {
      await LowStockAlert.getCqrsJoins(item);
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

    let lowStockAlerts = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    lowStockAlerts = await LowStockAlert.findAll(options);

    return lowStockAlerts;
  }
}

const dbListLowstockalerts = (input) => {
  const dbGetListCommand = new DbListLowstockalertsCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListLowstockalerts;
