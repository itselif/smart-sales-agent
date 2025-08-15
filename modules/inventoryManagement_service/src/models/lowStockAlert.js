const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Represents a low-stock or high-risk inventory item event; alerts sellers/managers of the condition and supports audit/resolution.
const LowStockAlert = sequelize.define(
  "lowStockAlert",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    inventoryItemId: {
      // Inventory item triggering this low-stock alert.
      type: DataTypes.UUID,
      allowNull: false,
    },
    alertType: {
      // Type of inventory alert: 0=lowStock, 1=outOfStock, 2=highRisk
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "lowStock",
    },
    alertTimestamp: {
      // Timestamp when alert was triggered.
      type: DataTypes.DATE,
      allowNull: false,
    },
    resolved: {
      // Flag for whether this alert has been acknowledged or resolved.
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    resolvedByUserId: {
      // User who resolved or acknowledged the alert (optional).
      type: DataTypes.UUID,
      allowNull: true,
    },
    resolvedTimestamp: {
      // Timestamp when alert was resolved or acknowledged.
      type: DataTypes.DATE,
      allowNull: true,
    },
    storeId: {
      // An ID value to represent the tenant id of the store
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: "00000000-0000-0000-0000-000000000000",
    },
    isActive: {
      // isActive property will be set to false when deleted
      // so that the document will be archived
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        unique: false,
        fields: ["inventoryItemId"],
      },
      {
        unique: false,
        fields: ["storeId"],
      },
    ],
  },
);

module.exports = LowStockAlert;
