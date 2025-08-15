const kafka = require("../../utils/kafka.client.js");
const { loadSmsProvider } = require("../../utils/provider.loader.js");
const consumer = kafka.consumer({
  groupId: `salesai1-notification-service-sms-consumer`,
});

// Load the sms provider based on the environment variable
const provider = loadSmsProvider();
const runSmsSenderListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: `salesai1-notification-service-notification-sms`,
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
          `salesai1-notification-service-notification-sms: `,
          error,
        );
      }
    },
  });
};

module.exports = runSmsSenderListener;
