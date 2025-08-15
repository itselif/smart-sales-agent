const { DataTypes } = require("sequelize");
const { getEnumValue } = require("serviceCommon");
const { ElasticIndexer } = require("serviceCommon");
const updateElasticIndexMappings = require("./elastic-index");
const { hexaLogger } = require("common");

const SaleTransaction = require("./saleTransaction");
const SaleTransactionHistory = require("./saleTransactionHistory");

SaleTransaction.prototype.getData = function () {
  const data = this.dataValues;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  // set enum Index and enum value
  const statusOptions = ["normal", "corrected", "canceled"];
  const dataTypestatusSaleTransaction = typeof data.status;
  const enumIndexstatusSaleTransaction =
    dataTypestatusSaleTransaction === "string"
      ? statusOptions.indexOf(data.status)
      : data.status;
  data.status_idx = enumIndexstatusSaleTransaction;
  data.status =
    enumIndexstatusSaleTransaction > -1
      ? statusOptions[enumIndexstatusSaleTransaction]
      : undefined;

  data._owner = data.sellerId ?? undefined;
  return data;
};

SaleTransactionHistory.prototype.getData = function () {
  const data = this.dataValues;

  data.saleTransaction = this.saleTransaction
    ? this.saleTransaction.getData()
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
  const changeTypeOptions = ["correction", "deletion"];
  const dataTypechangeTypeSaleTransactionHistory = typeof data.changeType;
  const enumIndexchangeTypeSaleTransactionHistory =
    dataTypechangeTypeSaleTransactionHistory === "string"
      ? changeTypeOptions.indexOf(data.changeType)
      : data.changeType;
  data.changeType_idx = enumIndexchangeTypeSaleTransactionHistory;
  data.changeType =
    enumIndexchangeTypeSaleTransactionHistory > -1
      ? changeTypeOptions[enumIndexchangeTypeSaleTransactionHistory]
      : undefined;

  return data;
};

SaleTransactionHistory.belongsTo(SaleTransaction, {
  as: "saleTransaction",
  foreignKey: "transactionId",
  targetKey: "id",
  constraints: false,
});

module.exports = {
  SaleTransaction,
  SaleTransactionHistory,
  updateElasticIndexMappings,
};
