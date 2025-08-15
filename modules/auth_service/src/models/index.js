const { DataTypes } = require("sequelize");
const { getEnumValue } = require("serviceCommon");
const { ElasticIndexer } = require("serviceCommon");
const updateElasticIndexMappings = require("./elastic-index");
const { hexaLogger } = require("common");

const User = require("./user");
const UserGroup = require("./userGroup");
const UserGroupMember = require("./userGroupMember");
const Store = require("./store");

User.prototype.getData = function () {
  const data = this.dataValues;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  return data;
};

UserGroup.prototype.getData = function () {
  const data = this.dataValues;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  return data;
};

UserGroupMember.prototype.getData = function () {
  const data = this.dataValues;

  data.group = this.group ? this.group.getData() : undefined;
  data.user = this.user ? this.user.getData() : undefined;
  data.owner = this.owner ? this.owner.getData() : undefined;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  return data;
};

UserGroupMember.belongsTo(UserGroup, {
  as: "group",
  foreignKey: "groupId",
  targetKey: "id",
  constraints: false,
});

UserGroupMember.belongsTo(User, {
  as: "user",
  foreignKey: "userId",
  targetKey: "id",
  constraints: false,
});

UserGroupMember.belongsTo(User, {
  as: "owner",
  foreignKey: "ownerId",
  targetKey: "id",
  constraints: false,
});

Store.prototype.getData = function () {
  const data = this.dataValues;

  data.owner = this.owner ? this.owner.getData() : undefined;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  data._owner = data.ownerId ?? undefined;
  return data;
};

Store.belongsTo(User, {
  as: "owner",
  foreignKey: "ownerId",
  targetKey: "id",
  constraints: false,
});

module.exports = {
  User,
  UserGroup,
  UserGroupMember,
  Store,
  updateElasticIndexMappings,
};
