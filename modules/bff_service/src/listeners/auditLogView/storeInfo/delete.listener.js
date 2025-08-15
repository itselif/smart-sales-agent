const kafka = require("common/kafka.client.js");
const {
  storeInfoReAuditLogView,
} = require("aggregates/auditLogView.aggregate");

const consumer = kafka.consumer({
  groupId: `auditLogView-storeInfo`,
});

const runDeleteListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "salesai1-elastic-index-store-deleted",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          `Received message on ${topic}: ${message.value.toString()}`,
        );

        const data = JSON.parse(message.value.toString());
        await storeInfoReAuditLogView(data.id);
      } catch (error) {
        console.error("salesai1-elastic-index-store-deleted : ", error);
      }
    },
  });
};

module.exports = runDeleteListener;
