const kafka = require("common/kafka.client.js");
const {
  activeManagersReCrossStoreComparisonView,
} = require("aggregates/crossStoreComparisonView.aggregate");

const consumer = kafka.consumer({
  groupId: `crossStoreComparisonView-activeManagers`,
});

const runDeleteListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "salesai1-elastic-index-storeAssignment-deleted",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          `Received message on ${topic}: ${message.value.toString()}`,
        );

        const data = JSON.parse(message.value.toString());
        await activeManagersReCrossStoreComparisonView(data.id);
      } catch (error) {
        console.error(
          "salesai1-elastic-index-storeAssignment-deleted : ",
          error,
        );
      }
    },
  });
};

module.exports = runDeleteListener;
