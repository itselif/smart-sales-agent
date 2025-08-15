const kafka = require("common/kafka.client.js");
const { userInfoReAuditLogView } = require("aggregates/auditLogView.aggregate");

const consumer = kafka.consumer({
  groupId: `auditLogView-userInfo`,
});

const runCreateListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "salesai1-elastic-index-user-created",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          `Received message on ${topic}: ${message.value.toString()}`,
        );

        const data = JSON.parse(message.value.toString());
        await userInfoReAuditLogView(data.id);
      } catch (error) {
        console.error("salesai1-elastic-index-user-created : ", error);
      }
    },
  });
};

module.exports = runCreateListener;
