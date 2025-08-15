const kafka = require("common/kafka.client.js");
const {
  inventoryDashboardViewAggregateData,
} = require("aggregates/inventoryDashboardView.aggregate");

const consumer = kafka.consumer({
  groupId: `inventoryDashboardView`,
});

const runUpdateListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "salesai1-elastic-index-inventoryItem-updated",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          `Received message on ${topic}: ${message.value.toString()}`,
        );

        const data = JSON.parse(message.value.toString());
        await inventoryDashboardViewAggregateData(data.id);
      } catch (error) {
        console.error("salesai1-elastic-index-inventoryItem-updated : ", error);
      }
    },
  });
};

module.exports = runUpdateListener;
