const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { SaleTransaction, SaleTransactionHistory } = require("models");

class DbListSaletransactionsCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListSaletransactions";
    this.emptyResult = true;
    this.objectName = "saleTransactions";
    this.serviceLabel = "salesai-salesmanagement-service";
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
    for (const saleTransaction of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (SaleTransaction.getCqrsJoins) {
      await SaleTransaction.getCqrsJoins(item);
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

    let saleTransactions = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    saleTransactions = await SaleTransaction.findAll(options);

    return saleTransactions;
  }
}

const dbListSaletransactions = (input) => {
  const dbGetListCommand = new DbListSaletransactionsCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListSaletransactions;
