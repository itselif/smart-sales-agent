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

const {
  StoreAssignmentQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getStoreAssignmentById = require("./utils/getStoreAssignmentById");

//not
//should i ask this here? is &&false intentionally added?

class DbUpdateStoreassignmentCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, StoreAssignment, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateStoreassignment";
    this.nullResult = false;
    this.objectName = "storeAssignment";
    this.serviceLabel = "salesai-storemanagement-service";
    this.joinedCriteria = false;
    this.dbEvent =
      "salesai1-storemanagement-service-dbevent-storeassignment-updated";
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

const dbUpdateStoreassignment = async (input) => {
  input.id = input.storeAssignmentId;
  const dbUpdateCommand = new DbUpdateStoreassignmentCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateStoreassignment;
