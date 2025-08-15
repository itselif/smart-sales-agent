const { DBGetListSequelizeCommand } = require("dbCommand");
const { sequelize, hexaLogger } = require("common");
const { Op } = require("sequelize");
const { User, UserGroup, UserGroupMember, Store } = require("models");

class DbListGroupmembersCommand extends DBGetListSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbListGroupmembers";
    this.emptyResult = true;
    this.objectName = "userGroupMembers";
    this.serviceLabel = "salesai-auth-service";
    this.input.pagination = null;
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  // should i add this here?

  // ask about this should i rename the whereClause to dataClause???

  async transposeResult() {
    for (const userGroupMember of this.dbData.items) {
      // tarnspose dbData item
    }
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }

  async getCqrsJoins(item) {
    if (UserGroupMember.getCqrsJoins) {
      await UserGroupMember.getCqrsJoins(item);
    }
  }

  async executeQuery() {
    const input = this.input;
    let options = { where: this.whereClause };
    if (input.sortBy) options.order = input.sortBy ?? [["id", "ASC"]];

    options.include = this.buildIncludes();
    if (options.include && options.include.length == 0) options.include = null;

    if (!input.getJoins) {
      options.include = null;
    }

    let userGroupMembers = null;

    const selectList = this.getSelectList();
    if (selectList && selectList.length) {
      options.attributes = selectList;
    }

    userGroupMembers = await UserGroupMember.findAll(options);

    return userGroupMembers;
  }
}

const dbListGroupmembers = (input) => {
  const dbGetListCommand = new DbListGroupmembersCommand(input);
  return dbGetListCommand.execute();
};

module.exports = dbListGroupmembers;
