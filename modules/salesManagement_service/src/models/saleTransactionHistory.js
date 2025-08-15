const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Audit log for sale transaction changes and corrections. Records every update or delete to a saleTransaction, including before/after snapshots, user who made the change, change type, timestamp, and provided justifications.
const SaleTransactionHistory = sequelize.define(
  "saleTransactionHistory",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    transactionId: {
      // Reference to the saleTransaction that was changed.
      type: DataTypes.UUID,
      allowNull: false,
    },
    changeType: {
      // Type of change applied: 0="correction", 1="deletion".
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "correction",
    },
    changedByUserId: {
      // User who made this change (usually manager or seller correcting/updating transaction).
      type: DataTypes.UUID,
      allowNull: false,
    },
    changeTimestamp: {
      // Timestamp when change was made.
      type: DataTypes.DATE,
      allowNull: false,
    },
    correctionJustification: {
      // User inputted justification (if any) given for the correction or deletion.
      type: DataTypes.TEXT,
      allowNull: true,
    },
    previousData: {
      // Snapshot of the saleTransaction before the change.
      type: DataTypes.JSONB,
      allowNull: false,
    },
    newData: {
      // Snapshot of the saleTransaction after the change (if correction).
      type: DataTypes.JSONB,
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
        fields: ["transactionId"],
      },
      {
        unique: false,
        fields: ["changedByUserId"],
      },
      {
        unique: false,
        fields: ["storeId"],
      },
    ],
  },
);

module.exports = SaleTransactionHistory;
