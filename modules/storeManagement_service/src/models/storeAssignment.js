const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Represents the assignment of a user (seller, manager) to one or more stores. Supports override/temporary assignments, status, and assignment type fields for audit and dynamic access enforcement.
const StoreAssignment = sequelize.define(
  "storeAssignment",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      // ID of the assigned user (references auth.user).
      type: DataTypes.UUID,
      allowNull: false,
    },
    storeId: {
      // ID of the store this assignment represents.
      type: DataTypes.UUID,
      allowNull: false,
    },
    role: {
      // User's functional role in this store assignment: 0=seller, 1=manager, 2=admin.
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "seller",
    },
    assignmentType: {
      // Assignment type: 0=normal, 1=override (for temporary/exception access).
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "normal",
    },
    status: {
      // Assignment status: 0=active, 1=revoked, 2=pending.
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active",
    },
    overrideJustification: {
      // If assignmentType is override, field storing justification for override (if required by policy).
      type: DataTypes.TEXT,
      allowNull: true,
    },
    validFrom: {
      // The date/time this assignment/override becomes valid.
      type: DataTypes.DATE,
      allowNull: true,
    },
    validUntil: {
      // If override, optional date/time until which assignment/override is valid (expiry).
      type: DataTypes.DATE,
      allowNull: true,
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
        fields: ["userId"],
      },
      {
        unique: false,
        fields: ["storeId"],
      },
      {
        unique: false,
        fields: ["assignmentType"],
      },

      {
        unique: true,
        fields: ["userId", "storeId", "assignmentType"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = StoreAssignment;
