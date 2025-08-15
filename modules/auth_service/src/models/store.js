const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//A data object that stores the information for store
const Store = sequelize.define(
  "store",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: {
      // A string value to represent one word name of the store
      type: DataTypes.STRING,
      allowNull: false,
    },
    codename: {
      // A string value to represent a unique code name for the store which is generated automatically using name
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullname: {
      // A string value to represent the fullname of the store
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      // A string value represent the url of the store avatar. Keep null for random avatar.
      type: DataTypes.STRING,
      allowNull: true,
    },
    ownerId: {
      // An ID value to represent the user id of store owner who created the tenant
      type: DataTypes.UUID,
      allowNull: false,
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
        fields: ["ownerId"],
      },

      {
        unique: true,
        fields: ["codename"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = Store;
