const sendEmailNotification = require("./email.publisher");
const sendPushNotification = require("./push.publisher");
const sendSmsNotification = require("./sms.publisher");

module.exports = {
  sendEmailNotification,
  sendPushNotification,
  sendSmsNotification,
};
