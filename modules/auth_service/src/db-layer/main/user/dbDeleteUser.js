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

const {
  getIdListOfUserGroupMemberByField,
  updateUserGroupMemberById,
  deleteUserGroupMemberById,
} = require("../userGroupMember");

const { UserQueryCacheInvalidator } = require("./query-cache-classes");
const { UserEntityCache } = require("./entity-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteUserCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, User, instanceMode);
    this.commandName = "dbDeleteUser";
    this.nullResult = false;
    this.objectName = "user";
    this.serviceLabel = "salesai-auth-service";
    this.dbEvent = "salesai1-auth-service-dbevent-user-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
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
    await elasticIndexer.deleteData(this.dbData.id);
  }

  //should i add this here?

  // ask about this should i rename the whereClause to dataClause???

  async transposeResult() {
    // transpose dbData
  }

  async syncJoins() {
    const promises = [];
    const dataId = this.dbData.id;
    // relationTargetKey should be used instead of id
    try {
      // delete refrring objects
      const idList_UserGroupMember_userId_user =
        await getIdListOfUserGroupMemberByField(
          "userId",
          this.dbData.id,
          false,
        );
      for (const itemId of idList_UserGroupMember_userId_user) {
        promises.push(deleteUserGroupMemberById(itemId));
      }

      // update referring objects
      const idList_UserGroupMember_ownerId_owner =
        await getIdListOfUserGroupMemberByField(
          "ownerId",
          this.dbData.id,
          false,
        );
      for (const itemId of idList_UserGroupMember_ownerId_owner) {
        promises.push(updateUserGroupMemberById(itemId, { ownerId: null }));
      }

      const idList_Store_ownerId_owner = await getIdListOfStoreByField(
        "ownerId",
        this.dbData.id,
        false,
      );
      for (const itemId of idList_Store_ownerId_owner) {
        promises.push(updateStoreById(itemId, { ownerId: null }));
      }

      // delete childs

      // update childs

      // delete & update parents ???

      // delete and update referred parents

      const results = await Promise.allSettled(promises);
      for (const result of results) {
        if (result instanceof Error) {
          console.log(
            "Single Error when synching delete of User on joined and parent objects:",
            dataId,
            result,
          );
          hexaLogger.insertError(
            "SyncJoinError",
            { function: "syncJoins", dataId: dataId },
            "->syncJoins",
            result,
          );
        }
      }
    } catch (err) {
      console.log(
        "Total Error when synching delete of User on joined and parent objects:",
        dataId,
        err,
      );
      hexaLogger.insertError(
        "SyncJoinsTotalError",
        { function: "syncJoins", dataId: dataId },
        "->syncJoins",
        err,
      );
    }
  }
}

const dbDeleteUser = async (input) => {
  input.id = input.userId;
  const dbDeleteCommand = new DbDeleteUserCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteUser;
