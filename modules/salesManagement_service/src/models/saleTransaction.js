const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Represents a retail sale transaction. Contains all information about a sale: store, seller, amounts, date, status (normal, corrected, canceled), and optional justification for corrections. Manages core sales lifecycle.
const SaleTransaction = sequelize.define(
  "saleTransaction",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    sellerId: {
      // User ID of the seller who created this sale transaction.
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      // Total sum of the sale transaction.
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      // ISO currency code for the transaction.
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "USD",
    },
    transactionDate: {
      // Date and time when the sale transaction occurred.
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      // Status of the sale transaction: 0=normal, 1=corrected, 2=canceled.
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "normal",
    },
    correctionJustification: {
      // Reason for correction, if the transaction was updated after initial entry. Required when status is 'corrected' or 'canceled'.
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
        fields: ["sellerId"],
      },
      {
        unique: false,
        fields: ["transactionDate"],
      },
      {
        unique: false,
        fields: ["status"],
      },
      {
        unique: false,
        fields: ["storeId"],
      },
    ],
  },
);

module.exports = SaleTransaction;
