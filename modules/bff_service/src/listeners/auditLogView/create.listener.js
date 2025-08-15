const kafka = require("common/kafka.client.js");
const {
  auditLogViewAggregateData,
} = require("aggregates/auditLogView.aggregate");

const consumer = kafka.consumer({
  groupId: `auditLogView`,
});

const runCreateListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "salesai1-elastic-index-auditLog-created",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          `Received message on ${topic}: ${message.value.toString()}`,
        );

        const data = JSON.parse(message.value.toString());
        await auditLogViewAggregateData(data.id);
      } catch (error) {
        console.error("salesai1-elastic-index-auditLog-created : ", error);
      }
    },
  });
};

module.exports = runCreateListener;
