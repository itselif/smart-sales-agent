const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { Store, StoreAssignment } = require("models");
const { Op } = require("sequelize");
const { sequelize } = require("common");

const { DBUpdateSequelizeCommand } = require("dbCommand");

const { StoreQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getStoreById = require("./utils/getStoreById");

//not
//should i ask this here? is &&false intentionally added?

class DbUpdateStoreCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, Store, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateStore";
    this.nullResult = false;
    this.objectName = "store";
    this.serviceLabel = "salesai-storemanagement-service";
    this.joinedCriteria = false;
    this.dbEvent = "salesai1-storemanagement-service-dbevent-store-updated";
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
    this.queryCacheInvalidator = new StoreQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "store",
      this.session,
      this.requestId,
    );
    const dbData = await getStoreById(this.dbData.id);
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

const dbUpdateStore = async (input) => {
  input.id = input.storeId;
  const dbUpdateCommand = new DbUpdateStoreCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateStore;
