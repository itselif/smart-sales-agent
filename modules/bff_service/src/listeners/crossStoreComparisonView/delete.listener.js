const kafka = require("common/kafka.client.js");
const {
  crossStoreComparisonViewAggregateData,
} = require("aggregates/crossStoreComparisonView.aggregate");

const consumer = kafka.consumer({
  groupId: `crossStoreComparisonView`,
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
        await crossStoreComparisonViewAggregateData(data.id);
      } catch (error) {
        console.error("salesai1-elastic-index-store-deleted : ", error);
      }
    },
  });
};

module.exports = runDeleteListener;
