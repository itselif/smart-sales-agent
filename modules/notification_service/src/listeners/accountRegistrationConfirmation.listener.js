const kafka = require("../utils/kafka.client.js");
const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const consumer = kafka.consumer({
  groupId: `salesai1-notification-service-accountRegistrationConfirmation-group`,
});

const accountRegistrationConfirmationListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "storeManagement.storeAssignment.created",
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
          template: "accountRegistrationConfirmationEmail",
          metadata: {
            ...notice,
            actionDeepLink: "&#39;/login&#39;",
            actionText: "&#39;Go to Login&#39;",
          },
        };

        const dataViewId = notice.id;
        const dataSource = await getDocument(
          "salesai1_userRegistrationConfirmationView",
          dataViewId,
        );

        this.dataSource = dataSource.source;
        mappedData.metadata = {
          ...mappedData.metadata,
          dataSource: dataSource.source,
        };

        const targetregisteredUser = mappedData.metadata.dataSource["userInfo"];
        mappedData.to = targetregisteredUser;
        await notificationService.sendNotification(mappedData);
      } catch (error) {
        console.error("storeManagement.storeAssignment.created ", error);
      }
    },
  });
};

module.exports = accountRegistrationConfirmationListener;
