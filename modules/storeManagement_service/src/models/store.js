const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Represents a retail store location and its properties. Includes lifecycle metadata such as activation status and store-level policy configuration fields.
const Store = sequelize.define(
  "store",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: {
      // Short, human-readable store name (display).
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullname: {
      // Full/store legal name (used for reporting, invoices, etc).
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      // The city/location in which this store operates.
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      // Public avatar image URL for the store (branding).
      type: DataTypes.STRING,
      allowNull: true,
    },
    active: {
      // Flag marking this store as currently operational/active.
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
        unique: true,
        fields: ["name"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = Store;
