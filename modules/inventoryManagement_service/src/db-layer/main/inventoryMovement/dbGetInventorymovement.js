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

class DbGetInventorymovementCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, InventoryMovement);
    this.commandName = "dbGetInventorymovement";
    this.nullResult = false;
    this.objectName = "inventoryMovement";
    this.serviceLabel = "salesai-inventorymanagement-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (InventoryMovement.getCqrsJoins)
      await InventoryMovement.getCqrsJoins(data);
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async checkEntityOwnership(entity) {
    return true;
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

const dbGetInventorymovement = (input) => {
  input.id = input.inventoryMovementId;
  const dbGetCommand = new DbGetInventorymovementCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetInventorymovement;
