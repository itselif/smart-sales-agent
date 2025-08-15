const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { InventoryItem, InventoryMovement, LowStockAlert } = require("models");

class DbListInventorymovementsCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListInventorymovements";
    this.emptyResult = true;
    this.objectName = "inventoryMovements";
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
    for (const inventoryMovement of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (InventoryMovement.getCqrsJoins) {
      await InventoryMovement.getCqrsJoins(item);
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

    let inventoryMovements = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    inventoryMovements = await InventoryMovement.findAll(options);

    return inventoryMovements;
  }
}

const dbListInventorymovements = (input) => {
  const dbGetListCommand = new DbListInventorymovementsCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListInventorymovements;
