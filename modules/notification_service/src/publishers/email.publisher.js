const kafkaPublish = require("../utils/publisher");

const sendEmailNotification = async (notification) => {
  try {
    console.log("sending email notification", notification);
    await kafkaPublish(
      `salesai1-notification-service-notification-email`,
      notification,
    );
  } catch (error) {
    console.error("Error publishing email notification", error);
  }
};
module.exports = sendEmailNotification;
