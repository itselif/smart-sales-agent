const kafka = require("../utils/kafka.client.js");
const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const consumer = kafka.consumer({
  groupId: `salesai1-notification-service-userVerification-group`,
});

const userVerificationListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "SalesAI-user-service-email-verification-start",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          `Received message on ${topic}: ${message.value.toString()}`,
        );

        const notice = JSON.parse(message.value.toString());

        const mappedData = {
          types: ["email"],
          isStored: false,
          template: "verification",
          metadata: {
            ...notice,
            actionDeepLink: "https://www.mindbricks.com",
            actionText: "Visit Mindbricks",
          },
        };

        if (!(notice.secretCode != null)) {
          console.log("condition not met", "notice.secretCode != null");
          return;
        }

        mappedData.to = notice["email"];
        await notificationService.sendNotification(mappedData);
      } catch (error) {
        console.error("SalesAI-user-service-email-verification-start ", error);
      }
    },
  });
};

module.exports = userVerificationListener;
