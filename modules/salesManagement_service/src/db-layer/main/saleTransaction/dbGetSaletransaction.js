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

class DbGetSaletransactionCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, SaleTransaction);
    this.commandName = "dbGetSaletransaction";
    this.nullResult = false;
    this.objectName = "saleTransaction";
    this.serviceLabel = "salesai-salesmanagement-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (SaleTransaction.getCqrsJoins) await SaleTransaction.getCqrsJoins(data);
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

const dbGetSaletransaction = (input) => {
  input.id = input.saleTransactionId;
  const dbGetCommand = new DbGetSaletransactionCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetSaletransaction;
