const kafka = require("common/kafka.client.js");
const {
  storeInfoReInventoryDashboardView,
} = require("aggregates/inventoryDashboardView.aggregate");

const consumer = kafka.consumer({
  groupId: `inventoryDashboardView-storeInfo`,
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
        await storeInfoReInventoryDashboardView(data.id);
      } catch (error) {
        console.error("salesai1-elastic-index-store-deleted : ", error);
      }
    },
  });
};

module.exports = runDeleteListener;
