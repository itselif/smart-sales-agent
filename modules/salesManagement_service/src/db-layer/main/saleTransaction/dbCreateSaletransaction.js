const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { SaleTransaction } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const {
  SaleTransactionQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getSaleTransactionById = require("./utils/getSaleTransactionById");

class DbCreateSaletransactionCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateSaletransaction";
    this.objectName = "saleTransaction";
    this.serviceLabel = "salesai-salesmanagement-service";
    this.dbEvent =
      "salesai1-salesmanagement-service-dbevent-saletransaction-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new SaleTransactionQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "saleTransaction",
      this.session,
      this.requestId,
    );
    const dbData = await getSaleTransactionById(this.dbData.id);
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

    let saleTransaction = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      if (!updated && this.dataClause.id && !exists) {
        saleTransaction =
          saleTransaction ||
          (await SaleTransaction.findByPk(this.dataClause.id));
        if (saleTransaction) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await saleTransaction.update(this.dataClause);
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
        "Error in checking unique index when creating SaleTransaction",
        eDetail,
      );
    }

    if (!updated && !exists) {
      saleTransaction = await SaleTransaction.create(this.dataClause);
    }

    this.dbData = saleTransaction.getData();
    this.input.saleTransaction = this.dbData;
    await this.create_childs();
  }
}

const dbCreateSaletransaction = async (input) => {
  const dbCreateCommand = new DbCreateSaletransactionCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateSaletransaction;
