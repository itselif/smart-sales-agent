const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { InventoryItem, InventoryMovement, LowStockAlert } = require("models");

const { InventoryItemQueryCache } = require("./query-cache-classes");

class DbListInventoryitemsCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListInventoryitems";
    this.emptyResult = true;
    this.objectName = "inventoryItems";
    this.serviceLabel = "salesai-inventorymanagement-service";
    this.input.pagination = null;
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  createQueryCacher(input, whereClause) {
    super.createQueryCacher(input, whereClause);
    this.queryCacher = new InventoryItemQueryCache(input, whereClause);
  }

  // should i add this here?

  // ask about this should i rename the whereClause to dataClause???

  async transposeResult() {
    for (const inventoryItem of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (InventoryItem.getCqrsJoins) {
      await InventoryItem.getCqrsJoins(item);
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

    let inventoryItems = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    inventoryItems = await InventoryItem.findAll(options);

    return inventoryItems;
  }
}

const dbListInventoryitems = (input) => {
  const dbGetListCommand = new DbListInventoryitemsCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListInventoryitems;
