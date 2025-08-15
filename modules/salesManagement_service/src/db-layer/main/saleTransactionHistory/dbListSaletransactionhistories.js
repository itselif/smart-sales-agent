const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { SaleTransaction, SaleTransactionHistory } = require("models");

class DbListSaletransactionhistoriesCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListSaletransactionhistories";
    this.emptyResult = true;
    this.objectName = "saleTransactionHistories";
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
    for (const saleTransactionHistory of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (SaleTransactionHistory.getCqrsJoins) {
      await SaleTransactionHistory.getCqrsJoins(item);
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

    let saleTransactionHistorys = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    saleTransactionHistorys = await SaleTransactionHistory.findAll(options);

    return saleTransactionHistorys;
  }
}

const dbListSaletransactionhistories = (input) => {
  const dbGetListCommand = new DbListSaletransactionhistoriesCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListSaletransactionhistories;
