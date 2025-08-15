const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//A data object that stores the user group information.
const UserGroup = sequelize.define(
  "userGroup",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    groupName: {
      //  A string value to represent the group name.
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      //  A string value to represent the groups icon.
      type: DataTypes.STRING,
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
    indexes: [],
  },
);

module.exports = UserGroup;
