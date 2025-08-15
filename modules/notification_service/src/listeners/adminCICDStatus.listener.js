const kafka = require("../utils/kafka.client.js");
const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const consumer = kafka.consumer({
  groupId: `salesai1-notification-service-adminCICDStatus-group`,
});

const adminCICDStatusListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "platformAdmin.cicdJob.statusChanged",
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
          isStored: true,
          template: "adminCICDStatusEmail",
          metadata: {
            ...notice,
            actionDeepLink: "&#39;/admin/cicd&#39;",
            actionText: "&#39;Open CI/CD Dashboard&#39;",
          },
        };

        mappedData.to = notice[""];
        await notificationService.sendNotification(mappedData);
      } catch (error) {
        console.error("platformAdmin.cicdJob.statusChanged ", error);
      }
    },
  });
};

module.exports = adminCICDStatusListener;
