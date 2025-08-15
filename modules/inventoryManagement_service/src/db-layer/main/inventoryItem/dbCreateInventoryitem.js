const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { InventoryItem } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const { InventoryItemQueryCacheInvalidator } = require("./query-cache-classes");
const { InventoryItemEntityCache } = require("./entity-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getInventoryItemById = require("./utils/getInventoryItemById");

class DbCreateInventoryitemCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateInventoryitem";
    this.objectName = "inventoryItem";
    this.serviceLabel = "salesai-inventorymanagement-service";
    this.dbEvent =
      "salesai1-inventorymanagement-service-dbevent-inventoryitem-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new InventoryItemQueryCacheInvalidator();
  }

  createEntityCacher() {
    super.createEntityCacher();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "inventoryItem",
      this.session,
      this.requestId,
    );
    const dbData = await getInventoryItemById(this.dbData.id);
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

    let inventoryItem = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      whereClause = {
        storeId: this.dataClause.storeId,
        productId: this.dataClause.productId,
      };

      inventoryItem =
        inventoryItem || (await InventoryItem.findOne({ where: whereClause }));

      if (inventoryItem) {
        delete this.dataClause.id;
        this.dataClause.isActive = true;
        if (!updated) await inventoryItem.update(this.dataClause);
        updated = true;
      }

      if (!updated && this.dataClause.id && !exists) {
        inventoryItem =
          inventoryItem || (await InventoryItem.findByPk(this.dataClause.id));
        if (inventoryItem) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await inventoryItem.update(this.dataClause);
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
        "Error in checking unique index when creating InventoryItem",
        eDetail,
      );
    }

    if (!updated && !exists) {
      inventoryItem = await InventoryItem.create(this.dataClause);
    }

    this.dbData = inventoryItem.getData();
    this.input.inventoryItem = this.dbData;
    await this.create_childs();
  }
}

const dbCreateInventoryitem = async (input) => {
  const dbCreateCommand = new DbCreateInventoryitemCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateInventoryitem;
