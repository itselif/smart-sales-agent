const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { User, UserGroup, UserGroupMember, Store } = require("models");
const { Op } = require("sequelize");
const { sequelize } = require("common");

const { DBUpdateSequelizeCommand } = require("dbCommand");

const { UserGroupQueryCacheInvalidator } = require("./query-cache-classes");
const { UserGroupEntityCache } = require("./entity-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getUserGroupById = require("./utils/getUserGroupById");

const { hashString } = require("common");

//not
//should i ask this here? is &&false intentionally added?

class DbUpdateGroupCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, UserGroup, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateGroup";
    this.nullResult = false;
    this.objectName = "userGroup";
    this.serviceLabel = "salesai-auth-service";
    this.joinedCriteria = false;
    this.dbEvent = "salesai1-auth-service-dbevent-usergroup-updated";
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
    this.queryCacheInvalidator = new UserGroupQueryCacheInvalidator();
  }

  createEntityCacher() {
    super.createEntityCacher();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "userGroup",
      this.session,
      this.requestId,
    );
    const dbData = await getUserGroupById(this.dbData.id);
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

const dbUpdateGroup = async (input) => {
  input.id = input.userGroupId;
  const dbUpdateCommand = new DbUpdateGroupCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateGroup;
