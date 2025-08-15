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

class DbGetLowstockalertCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, LowStockAlert);
    this.commandName = "dbGetLowstockalert";
    this.nullResult = false;
    this.objectName = "lowStockAlert";
    this.serviceLabel = "salesai-inventorymanagement-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (LowStockAlert.getCqrsJoins) await LowStockAlert.getCqrsJoins(data);
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

const dbGetLowstockalert = (input) => {
  input.id = input.lowStockAlertId;
  const dbGetCommand = new DbGetLowstockalertCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetLowstockalert;
