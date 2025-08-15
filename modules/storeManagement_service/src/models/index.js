const { DataTypes } = require("sequelize");
const { getEnumValue } = require("serviceCommon");
const { ElasticIndexer } = require("serviceCommon");
const updateElasticIndexMappings = require("./elastic-index");
const { hexaLogger } = require("common");

const Store = require("./store");
const StoreAssignment = require("./storeAssignment");

Store.prototype.getData = function () {
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

StoreAssignment.prototype.getData = function () {
  const data = this.dataValues;

  data.storeAssignment = this.storeAssignment
    ? this.storeAssignment.getData()
    : undefined;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  // set enum Index and enum value
  const roleOptions = ["seller", "manager", "admin"];
  const dataTyperoleStoreAssignment = typeof data.role;
  const enumIndexroleStoreAssignment =
    dataTyperoleStoreAssignment === "string"
      ? roleOptions.indexOf(data.role)
      : data.role;
  data.role_idx = enumIndexroleStoreAssignment;
  data.role =
    enumIndexroleStoreAssignment > -1
      ? roleOptions[enumIndexroleStoreAssignment]
      : undefined;
  // set enum Index and enum value
  const assignmentTypeOptions = ["normal", "override"];
  const dataTypeassignmentTypeStoreAssignment = typeof data.assignmentType;
  const enumIndexassignmentTypeStoreAssignment =
    dataTypeassignmentTypeStoreAssignment === "string"
      ? assignmentTypeOptions.indexOf(data.assignmentType)
      : data.assignmentType;
  data.assignmentType_idx = enumIndexassignmentTypeStoreAssignment;
  data.assignmentType =
    enumIndexassignmentTypeStoreAssignment > -1
      ? assignmentTypeOptions[enumIndexassignmentTypeStoreAssignment]
      : undefined;
  // set enum Index and enum value
  const statusOptions = ["active", "revoked", "pending"];
  const dataTypestatusStoreAssignment = typeof data.status;
  const enumIndexstatusStoreAssignment =
    dataTypestatusStoreAssignment === "string"
      ? statusOptions.indexOf(data.status)
      : data.status;
  data.status_idx = enumIndexstatusStoreAssignment;
  data.status =
    enumIndexstatusStoreAssignment > -1
      ? statusOptions[enumIndexstatusStoreAssignment]
      : undefined;

  return data;
};

StoreAssignment.belongsTo(Store, {
  as: "storeAssignment",
  foreignKey: "storeId",
  targetKey: "id",
  constraints: false,
});

module.exports = {
  Store,
  StoreAssignment,
  updateElasticIndexMappings,
};
