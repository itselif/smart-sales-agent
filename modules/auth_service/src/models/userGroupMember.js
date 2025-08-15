const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//A data object that stores the members of the user group.
const UserGroupMember = sequelize.define(
  "userGroupMember",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    groupId: {
      //  An ID value to represent the group that the user is asssigned as a memeber to.
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      //  An ID value to represent the user that is assgined as a member to the group.
      type: DataTypes.UUID,
      allowNull: false,
    },
    ownerId: {
      // An ID value to represent the admin user who assgined the member.
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
        fields: ["groupId"],
      },
      {
        unique: false,
        fields: ["userId"],
      },
      {
        unique: false,
        fields: ["ownerId"],
      },

      {
        unique: true,
        fields: ["userId", "groupId"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = UserGroupMember;
