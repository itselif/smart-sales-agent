const kafka = require("common/kafka.client.js");
const {
  sellerInfoReSalesDashboardView,
} = require("aggregates/salesDashboardView.aggregate");

const consumer = kafka.consumer({
  groupId: `salesDashboardView-sellerInfo`,
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
        await sellerInfoReSalesDashboardView(data.id);
      } catch (error) {
        console.error("salesai1-elastic-index-user-created : ", error);
      }
    },
  });
};

module.exports = runCreateListener;
