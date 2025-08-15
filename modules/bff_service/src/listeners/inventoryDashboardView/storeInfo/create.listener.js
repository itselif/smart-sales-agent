const kafka = require("common/kafka.client.js");
const {
  storeInfoReInventoryDashboardView,
} = require("aggregates/inventoryDashboardView.aggregate");

const consumer = kafka.consumer({
  groupId: `inventoryDashboardView-storeInfo`,
});

const runCreateListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "salesai1-elastic-index-store-created",
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
        console.error("salesai1-elastic-index-store-created : ", error);
      }
    },
  });
};

module.exports = runCreateListener;
