const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { StoreAssignment } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const {
  StoreAssignmentQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getStoreAssignmentById = require("./utils/getStoreAssignmentById");

class DbCreateStoreassignmentCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateStoreassignment";
    this.objectName = "storeAssignment";
    this.serviceLabel = "salesai-storemanagement-service";
    this.dbEvent =
      "salesai1-storemanagement-service-dbevent-storeassignment-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new StoreAssignmentQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "storeAssignment",
      this.session,
      this.requestId,
    );
    const dbData = await getStoreAssignmentById(this.dbData.id);
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

    let storeAssignment = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      whereClause = {
        userId: this.dataClause.userId,
        storeId: this.dataClause.storeId,
        assignmentType: this.dataClause.assignmentType,
      };

      storeAssignment =
        storeAssignment ||
        (await StoreAssignment.findOne({ where: whereClause }));

      if (storeAssignment) {
        throw new BadRequestError(
          "errMsg_DuplicateIndexErrorWithFields:" +
            "userId-storeId-assignmentType",
        );
      }

      if (!updated && this.dataClause.id && !exists) {
        storeAssignment =
          storeAssignment ||
          (await StoreAssignment.findByPk(this.dataClause.id));
        if (storeAssignment) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await storeAssignment.update(this.dataClause);
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
        "Error in checking unique index when creating StoreAssignment",
        eDetail,
      );
    }

    if (!updated && !exists) {
      storeAssignment = await StoreAssignment.create(this.dataClause);
    }

    this.dbData = storeAssignment.getData();
    this.input.storeAssignment = this.dbData;
    await this.create_childs();
  }
}

const dbCreateStoreassignment = async (input) => {
  const dbCreateCommand = new DbCreateStoreassignmentCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateStoreassignment;
