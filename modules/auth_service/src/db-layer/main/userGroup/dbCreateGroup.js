const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { UserGroup } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const { UserGroupQueryCacheInvalidator } = require("./query-cache-classes");
const { UserGroupEntityCache } = require("./entity-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getUserGroupById = require("./utils/getUserGroupById");

const { hashString } = require("common");

class DbCreateGroupCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateGroup";
    this.objectName = "userGroup";
    this.serviceLabel = "salesai-auth-service";
    this.dbEvent = "salesai1-auth-service-dbevent-usergroup-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
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

  // should i add hooksDbLayer here?

  // ask about this should i rename the whereClause to dataClause???

  async create_childs() {}

  async transposeResult() {
    // transpose dbData
  }

  async runDbCommand() {
    await super.runDbCommand();

    let userGroup = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      if (!updated && this.dataClause.id && !exists) {
        userGroup = userGroup || (await UserGroup.findByPk(this.dataClause.id));
        if (userGroup) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await userGroup.update(this.dataClause);
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
        "Error in checking unique index when creating UserGroup",
        eDetail,
      );
    }

    if (!updated && !exists) {
      userGroup = await UserGroup.create(this.dataClause);
    }

    this.dbData = userGroup.getData();
    this.input.userGroup = this.dbData;
    await this.create_childs();
  }
}

const dbCreateGroup = async (input) => {
  const dbCreateCommand = new DbCreateGroupCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateGroup;
