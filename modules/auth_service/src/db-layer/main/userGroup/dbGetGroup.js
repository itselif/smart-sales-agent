const { sequelize } = require("common");
const { Op } = require("sequelize");
const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");

const { User, UserGroup, UserGroupMember, Store } = require("models");

const { DBGetSequelizeCommand } = require("dbCommand");

const { UserGroupEntityCache } = require("./entity-cache-classes");

class DbGetGroupCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, UserGroup);
    this.commandName = "dbGetGroup";
    this.nullResult = false;
    this.objectName = "userGroup";
    this.serviceLabel = "salesai-auth-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (UserGroup.getCqrsJoins) await UserGroup.getCqrsJoins(data);
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async checkEntityOwnership(entity) {
    return true;
  }

  createEntityCacher() {
    super.createEntityCacher();
  }

  async transposeResult() {
    // transpose dbData
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }
}

const dbGetGroup = (input) => {
  input.id = input.userGroupId;
  const dbGetCommand = new DbGetGroupCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetGroup;
