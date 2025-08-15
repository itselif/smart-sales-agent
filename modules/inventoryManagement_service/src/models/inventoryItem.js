const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Tracks the quantity and status of a specific product in a given store, including thresholds for low-stock alerts and isolation by store.
const InventoryItem = sequelize.define(
  "inventoryItem",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    productId: {
      // Unique product SKU or identifier (string, as no central product object is currently defined).
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      // The current quantity of this product in the store's inventory.
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      // Status of inventory item: 0=in-stock, 1=out-of-stock, 2=low-stock, 3=damaged, 4=reserved
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "inStock",
    },
    lowStockThreshold: {
      // Threshold quantity; if quantity <= this value, the item is considered low-stock and triggers alerts.
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    lastSyncTimestamp: {
      // Timestamp when the inventoryItem was last synchronized with remote/manual updates.
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
        fields: ["productId"],
      },
      {
        unique: false,
        fields: ["storeId"],
      },

      {
        unique: true,
        fields: ["storeId", "productId"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = InventoryItem;
