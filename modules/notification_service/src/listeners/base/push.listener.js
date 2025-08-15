const kafka = require("../../utils/kafka.client.js");
const { loadPushProvider } = require("../../utils/provider.loader.js");
const consumer = kafka.consumer({
  groupId: `salesai1-notification-service-push-consumer`,
});

// Load the push provider based on the environment variable
const provider = loadPushProvider();
const runPushSenderListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: `salesai1-notification-service-notification-push`,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          `Received message on ${topic}: ${message.value.toString()}`,
        );
        const noticeData = JSON.parse(message.value.toString());
        await provider.send(noticeData);
      } catch (error) {
        console.error(
          `salesai1-notification-service-notification-push: `,
          error,
        );
      }
    },
  });
};

module.exports = runPushSenderListener;
