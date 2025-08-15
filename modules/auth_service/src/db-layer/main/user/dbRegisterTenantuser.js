const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { User } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { DBCreateSequelizeCommand } = require("dbCommand");

const { UserQueryCacheInvalidator } = require("./query-cache-classes");
const { UserEntityCache } = require("./entity-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getUserById = require("./utils/getUserById");

const { hashString } = require("common");

class DbRegisterTenantuserCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbRegisterTenantuser";
    this.objectName = "user";
    this.serviceLabel = "salesai-auth-service";
    this.dbEvent = "salesai1-auth-service-dbevent-user-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new UserQueryCacheInvalidator();
  }

  createEntityCacher() {
    super.createEntityCacher();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "user",
      this.session,
      this.requestId,
    );
    const dbData = await getUserById(this.dbData.id);
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

    let user = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      whereClause = {
        storeId: this.dataClause.storeId,
        email: this.dataClause.email,
      };

      user = user || (await User.findOne({ where: whereClause }));

      if (user) {
        throw new BadRequestError(
          "errMsg_DuplicateIndexErrorWithFields:" + "storeId-email",
        );
      }

      if (!updated && this.dataClause.id && !exists) {
        user = user || (await User.findByPk(this.dataClause.id));
        if (user) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await user.update(this.dataClause);
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
        "Error in checking unique index when creating User",
        eDetail,
      );
    }

    if (!updated && !exists) {
      user = await User.create(this.dataClause);
    }

    this.dbData = user.getData();
    this.input.user = this.dbData;
    await this.create_childs();
  }
}

const dbRegisterTenantuser = async (input) => {
  const dbCreateCommand = new DbRegisterTenantuserCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbRegisterTenantuser;
