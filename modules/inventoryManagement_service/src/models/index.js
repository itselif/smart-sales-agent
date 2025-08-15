const { DataTypes } = require("sequelize");
const { getEnumValue } = require("serviceCommon");
const { ElasticIndexer } = require("serviceCommon");
const updateElasticIndexMappings = require("./elastic-index");
const { hexaLogger } = require("common");

const InventoryItem = require("./inventoryItem");
const InventoryMovement = require("./inventoryMovement");
const LowStockAlert = require("./lowStockAlert");

InventoryItem.prototype.getData = function () {
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
  const statusOptions = [
    "inStock",
    "outOfStock",
    "lowStock",
    "damaged",
    "reserved",
  ];
  const dataTypestatusInventoryItem = typeof data.status;
  const enumIndexstatusInventoryItem =
    dataTypestatusInventoryItem === "string"
      ? statusOptions.indexOf(data.status)
      : data.status;
  data.status_idx = enumIndexstatusInventoryItem;
  data.status =
    enumIndexstatusInventoryItem > -1
      ? statusOptions[enumIndexstatusInventoryItem]
      : undefined;

  return data;
};

InventoryMovement.prototype.getData = function () {
  const data = this.dataValues;

  data.inventoryItem = this.inventoryItem
    ? this.inventoryItem.getData()
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
  const movementTypeOptions = [
    "sale",
    "restock",
    "manualAdjustment",
    "correction",
    "damage",
    "transfer",
  ];
  const dataTypemovementTypeInventoryMovement = typeof data.movementType;
  const enumIndexmovementTypeInventoryMovement =
    dataTypemovementTypeInventoryMovement === "string"
      ? movementTypeOptions.indexOf(data.movementType)
      : data.movementType;
  data.movementType_idx = enumIndexmovementTypeInventoryMovement;
  data.movementType =
    enumIndexmovementTypeInventoryMovement > -1
      ? movementTypeOptions[enumIndexmovementTypeInventoryMovement]
      : undefined;

  return data;
};

InventoryMovement.belongsTo(InventoryItem, {
  as: "inventoryItem",
  foreignKey: "inventoryItemId",
  targetKey: "id",
  constraints: false,
});

LowStockAlert.prototype.getData = function () {
  const data = this.dataValues;

  data.inventoryItem = this.inventoryItem
    ? this.inventoryItem.getData()
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
  const alertTypeOptions = ["lowStock", "outOfStock", "highRisk"];
  const dataTypealertTypeLowStockAlert = typeof data.alertType;
  const enumIndexalertTypeLowStockAlert =
    dataTypealertTypeLowStockAlert === "string"
      ? alertTypeOptions.indexOf(data.alertType)
      : data.alertType;
  data.alertType_idx = enumIndexalertTypeLowStockAlert;
  data.alertType =
    enumIndexalertTypeLowStockAlert > -1
      ? alertTypeOptions[enumIndexalertTypeLowStockAlert]
      : undefined;

  return data;
};

LowStockAlert.belongsTo(InventoryItem, {
  as: "inventoryItem",
  foreignKey: "inventoryItemId",
  targetKey: "id",
  constraints: false,
});

module.exports = {
  InventoryItem,
  InventoryMovement,
  LowStockAlert,
  updateElasticIndexMappings,
};
