module.exports = (sequelize, Sequelize) => {
  const Notification = sequelize.define(
    "Notifications",
    {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      body: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isSeen: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    },
  );

  return Notification;
};
