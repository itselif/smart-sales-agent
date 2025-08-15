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

const {
  StoreAssignmentQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteStoreassignmentCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, StoreAssignment, instanceMode);
    this.commandName = "dbDeleteStoreassignment";
    this.nullResult = false;
    this.objectName = "storeAssignment";
    this.serviceLabel = "salesai-storemanagement-service";
    this.dbEvent =
      "salesai1-storemanagement-service-dbevent-storeassignment-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
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
    await elasticIndexer.deleteData(this.dbData.id);
  }

  //should i add this here?

  // ask about this should i rename the whereClause to dataClause???

  async transposeResult() {
    // transpose dbData
  }
}

const dbDeleteStoreassignment = async (input) => {
  input.id = input.storeAssignmentId;
  const dbDeleteCommand = new DbDeleteStoreassignmentCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteStoreassignment;
