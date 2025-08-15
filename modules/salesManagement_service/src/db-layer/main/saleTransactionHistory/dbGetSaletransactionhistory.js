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

const { SaleTransaction, SaleTransactionHistory } = require("models");

const { DBGetSequelizeCommand } = require("dbCommand");

class DbGetSaletransactionhistoryCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, SaleTransactionHistory);
    this.commandName = "dbGetSaletransactionhistory";
    this.nullResult = false;
    this.objectName = "saleTransactionHistory";
    this.serviceLabel = "salesai-salesmanagement-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (SaleTransactionHistory.getCqrsJoins)
      await SaleTransactionHistory.getCqrsJoins(data);
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

const dbGetSaletransactionhistory = (input) => {
  input.id = input.saleTransactionHistoryId;
  const dbGetCommand = new DbGetSaletransactionhistoryCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetSaletransactionhistory;
