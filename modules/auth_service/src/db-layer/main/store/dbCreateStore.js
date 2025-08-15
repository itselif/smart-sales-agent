const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { Store } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const { StoreQueryCacheInvalidator } = require("./query-cache-classes");
const { StoreEntityCache } = require("./entity-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getStoreById = require("./utils/getStoreById");

class DbCreateStoreCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateStore";
    this.objectName = "store";
    this.serviceLabel = "salesai-auth-service";
    this.dbEvent = "salesai1-auth-service-dbevent-store-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new StoreQueryCacheInvalidator();
  }

  createEntityCacher() {
    super.createEntityCacher();
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

  // should i add hooksDbLayer here?

  // ask about this should i rename the whereClause to dataClause???

  async create_childs() {}

  async transposeResult() {
    // transpose dbData
  }

  async runDbCommand() {
    await super.runDbCommand();

    let store = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      if (!updated && this.dataClause.id && !exists) {
        store = store || (await Store.findByPk(this.dataClause.id));
        if (store) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await store.update(this.dataClause);
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
        "Error in checking unique index when creating Store",
        eDetail,
      );
    }

    if (!updated && !exists) {
      store = await Store.create(this.dataClause);
    }

    this.dbData = store.getData();
    this.input.store = this.dbData;
    await this.create_childs();
  }
}

const dbCreateStore = async (input) => {
  const dbCreateCommand = new DbCreateStoreCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateStore;
