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

const { UserGroupMemberEntityCache } = require("./entity-cache-classes");

class DbGetGroupmemberCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, UserGroupMember);
    this.commandName = "dbGetGroupmember";
    this.nullResult = false;
    this.objectName = "userGroupMember";
    this.serviceLabel = "salesai-auth-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (UserGroupMember.getCqrsJoins) await UserGroupMember.getCqrsJoins(data);
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

const dbGetGroupmember = (input) => {
  input.id = input.userGroupMemberId;
  const dbGetCommand = new DbGetGroupmemberCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetGroupmember;
