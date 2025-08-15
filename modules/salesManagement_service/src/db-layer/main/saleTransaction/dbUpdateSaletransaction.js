const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { SaleTransaction, SaleTransactionHistory } = require("models");
const { Op } = require("sequelize");
const { sequelize } = require("common");

const { DBUpdateSequelizeCommand } = require("dbCommand");

const {
  SaleTransactionQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getSaleTransactionById = require("./utils/getSaleTransactionById");

//not
//should i ask this here? is &&false intentionally added?

class DbUpdateSaletransactionCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, SaleTransaction, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateSaletransaction";
    this.nullResult = false;
    this.objectName = "saleTransaction";
    this.serviceLabel = "salesai-salesmanagement-service";
    this.joinedCriteria = false;
    this.dbEvent =
      "salesai1-salesmanagement-service-dbevent-saletransaction-updated";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async transposeResult() {
    // transpose dbData
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

  // ask about this should i rename the whereClause to dataClause???

  async setCalculatedFieldsAfterInstance(data) {
    const input = this.input;
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }
}

const dbUpdateSaletransaction = async (input) => {
  input.id = input.saleTransactionId;
  const dbUpdateCommand = new DbUpdateSaletransactionCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateSaletransaction;
