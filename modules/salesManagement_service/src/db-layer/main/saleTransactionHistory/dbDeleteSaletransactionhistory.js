const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { SaleTransactionHistory } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const {
  SaleTransactionHistoryQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteSaletransactionhistoryCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, SaleTransactionHistory, instanceMode);
    this.commandName = "dbDeleteSaletransactionhistory";
    this.nullResult = false;
    this.objectName = "saleTransactionHistory";
    this.serviceLabel = "salesai-salesmanagement-service";
    this.dbEvent =
      "salesai1-salesmanagement-service-dbevent-saletransactionhistory-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator =
      new SaleTransactionHistoryQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "saleTransactionHistory",
      this.session,
      this.requestId,
    );
    await elasticIndexer.deleteData(this.dbData.id);
  }

  //should i add this here?

  // ask about this should i rename the whereClause to dataClause???

  async transposeResult() {
    // transpose dbData
  }
}

const dbDeleteSaletransactionhistory = async (input) => {
  input.id = input.saleTransactionHistoryId;
  const dbDeleteCommand = new DbDeleteSaletransactionhistoryCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteSaletransactionhistory;
