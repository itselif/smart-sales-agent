const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//A data object that stores the user information and handles login settings.
const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    email: {
      //  A string value to represent the user's email.
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      //  A string value to represent the user's password. It will be stored as hashed.
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullname: {
      // A string value to represent the fullname of the user
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      // The avatar url of the user. A random avatar will be generated if not provided
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailVerified: {
      // A boolean value to represent the email verification status of the user.
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
        fields: ["email"],
      },
      {
        unique: false,
        fields: ["storeId"],
      },

      {
        unique: true,
        fields: ["storeId", "email"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = User;
