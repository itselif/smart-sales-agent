const kafka = require("common/kafka.client.js");
const {
  lowStockAlertsReInventoryDashboardView,
} = require("aggregates/inventoryDashboardView.aggregate");

const consumer = kafka.consumer({
  groupId: `inventoryDashboardView-lowStockAlerts`,
});

const runDeleteListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "salesai1-elastic-index-lowStockAlert-deleted",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          `Received message on ${topic}: ${message.value.toString()}`,
        );

        const data = JSON.parse(message.value.toString());
        await lowStockAlertsReInventoryDashboardView(data.id);
      } catch (error) {
        console.error("salesai1-elastic-index-lowStockAlert-deleted : ", error);
      }
    },
  });
};

module.exports = runDeleteListener;
