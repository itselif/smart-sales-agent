const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Logs each inventory movement (increase or decrease), recording the change type, value, reason, and related user and inventory item.
const InventoryMovement = sequelize.define(
  "inventoryMovement",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    inventoryItemId: {
      // Reference to the inventoryItem this movement relates to.
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantityDelta: {
      // Amount of increase (+) or decrease (-) in inventory for this movement.
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    movementType: {
      // Type of inventory movement: 0=sale, 1=restock, 2=manualAdjustment, 3=correction, 4=dump/damage, 5=transfer.
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "sale",
    },
    movementTimestamp: {
      // Timestamp when the movement occurred.
      type: DataTypes.DATE,
      allowNull: false,
    },
    userId: {
      // User who performed the movement or adjustment.
      type: DataTypes.UUID,
      allowNull: false,
    },
    movementReason: {
      // Freeform reason comment for this movement (optional unless manual/correction).
      type: DataTypes.TEXT,
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
        fields: ["movementTimestamp"],
      },
      {
        unique: false,
        fields: ["storeId"],
      },

      {
        unique: true,
        fields: ["inventoryItemId", "movementTimestamp"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = InventoryMovement;
