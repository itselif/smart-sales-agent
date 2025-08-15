const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { UserGroupMember } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const {
  UserGroupMemberQueryCacheInvalidator,
} = require("./query-cache-classes");
const { UserGroupMemberEntityCache } = require("./entity-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteGroupmemberCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, UserGroupMember, instanceMode);
    this.commandName = "dbDeleteGroupmember";
    this.nullResult = false;
    this.objectName = "userGroupMember";
    this.serviceLabel = "salesai-auth-service";
    this.dbEvent = "salesai1-auth-service-dbevent-usergroupmember-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new UserGroupMemberQueryCacheInvalidator();
  }

  createEntityCacher() {
    super.createEntityCacher();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "userGroupMember",
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

const dbDeleteGroupmember = async (input) => {
  input.id = input.userGroupMemberId;
  const dbDeleteCommand = new DbDeleteGroupmemberCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteGroupmember;
