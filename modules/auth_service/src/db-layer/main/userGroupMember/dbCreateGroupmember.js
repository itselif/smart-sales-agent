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

const { DBCreateSequelizeCommand } = require("dbCommand");

const {
  UserGroupMemberQueryCacheInvalidator,
} = require("./query-cache-classes");
const { UserGroupMemberEntityCache } = require("./entity-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getUserGroupMemberById = require("./utils/getUserGroupMemberById");

class DbCreateGroupmemberCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateGroupmember";
    this.objectName = "userGroupMember";
    this.serviceLabel = "salesai-auth-service";
    this.dbEvent = "salesai1-auth-service-dbevent-usergroupmember-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
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
    const dbData = await getUserGroupMemberById(this.dbData.id);
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

    let userGroupMember = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      whereClause = {
        userId: this.dataClause.userId,
        groupId: this.dataClause.groupId,
      };

      userGroupMember =
        userGroupMember ||
        (await UserGroupMember.findOne({ where: whereClause }));

      if (userGroupMember) {
        delete this.dataClause.id;
        this.dataClause.isActive = true;
        if (!updated) await userGroupMember.update(this.dataClause);
        updated = true;
      }

      if (!updated && this.dataClause.id && !exists) {
        userGroupMember =
          userGroupMember ||
          (await UserGroupMember.findByPk(this.dataClause.id));
        if (userGroupMember) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await userGroupMember.update(this.dataClause);
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
        "Error in checking unique index when creating UserGroupMember",
        eDetail,
      );
    }

    if (!updated && !exists) {
      userGroupMember = await UserGroupMember.create(this.dataClause);
    }

    this.dbData = userGroupMember.getData();
    this.input.userGroupMember = this.dbData;
    await this.create_childs();
  }
}

const dbCreateGroupmember = async (input) => {
  const dbCreateCommand = new DbCreateGroupmemberCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateGroupmember;
