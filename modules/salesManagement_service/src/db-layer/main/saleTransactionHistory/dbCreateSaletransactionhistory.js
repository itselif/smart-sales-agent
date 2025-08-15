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

const { DBCreateSequelizeCommand } = require("dbCommand");

const {
  SaleTransactionHistoryQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getSaleTransactionHistoryById = require("./utils/getSaleTransactionHistoryById");

class DbCreateSaletransactionhistoryCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateSaletransactionhistory";
    this.objectName = "saleTransactionHistory";
    this.serviceLabel = "salesai-salesmanagement-service";
    this.dbEvent =
      "salesai1-salesmanagement-service-dbevent-saletransactionhistory-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
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
    const dbData = await getSaleTransactionHistoryById(this.dbData.id);
    await elasticIndexer.indexData(dbData);
  }

  // should i add hooksDbLayer here?

  // ask about this should i rename the whereClause to dataClause???

  async create_childs() {}

  async transposeResult() {
    // transpose dbData
  }

  async runDbCommand() {
    await super.runDbCommand();

    let saleTransactionHistory = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      if (!updated && this.dataClause.id && !exists) {
        saleTransactionHistory =
          saleTransactionHistory ||
          (await SaleTransactionHistory.findByPk(this.dataClause.id));
        if (saleTransactionHistory) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await saleTransactionHistory.update(this.dataClause);
          updated = true;
        }
      }
    } catch (error) {
      const eDetail = {
        whereClause: this.normalizeSequalizeOps(whereClause),
        dataClause: this.dataClause,
        errorStack: error.stack,
        checkoutResult: this.input.checkoutResult,
      };
      throw new HttpServerError(
        "Error in checking unique index when creating SaleTransactionHistory",
        eDetail,
      );
    }

    if (!updated && !exists) {
      saleTransactionHistory = await SaleTransactionHistory.create(
        this.dataClause,
      );
    }

    this.dbData = saleTransactionHistory.getData();
    this.input.saleTransactionHistory = this.dbData;
    await this.create_childs();
  }
}

const dbCreateSaletransactionhistory = async (input) => {
  const dbCreateCommand = new DbCreateSaletransactionhistoryCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateSaletransactionhistory;
