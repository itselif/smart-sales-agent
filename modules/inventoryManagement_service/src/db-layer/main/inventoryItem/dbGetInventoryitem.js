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

const { InventoryItem, InventoryMovement, LowStockAlert } = require("models");

const { DBGetSequelizeCommand } = require("dbCommand");

const { InventoryItemEntityCache } = require("./entity-cache-classes");

class DbGetInventoryitemCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, InventoryItem);
    this.commandName = "dbGetInventoryitem";
    this.nullResult = false;
    this.objectName = "inventoryItem";
    this.serviceLabel = "salesai-inventorymanagement-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (InventoryItem.getCqrsJoins) await InventoryItem.getCqrsJoins(data);
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async checkEntityOwnership(entity) {
    return true;
  }

  createEntityCacher() {
    super.createEntityCacher();
    this.entityCacher = new InventoryItemEntityCache();
    this.entityCacher.defaultId = this.input.inventoryItemId;
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

const dbGetInventoryitem = (input) => {
  input.id = input.inventoryItemId;
  const dbGetCommand = new DbGetInventoryitemCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetInventoryitem;
