module.exports = (sequelize, Sequelize) => {
  const DeviceToken = sequelize.define(
    "DeviceTokens",
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      deviceId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notificationToken: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      os: {
        type: Sequelize.ENUM("IOS", "ANDROID", "WEB"),
        allowNull: false,
      },
      osVersion: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      osModel: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    },
  );

  return DeviceToken;
};
