const kafka = require("../../utils/kafka.client.js");
const { loadEmailProvider } = require("../../utils/provider.loader.js");
const consumer = kafka.consumer({
  groupId: `salesai1-notification-service-email-consumer`,
});

// Load the email provider based on the environment variable
const provider = loadEmailProvider();
const runEmailSenderListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: `salesai1-notification-service-notification-email`,
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
          `salesai1-notification-service-notification-email: `,
          error,
        );
      }
    },
  });
};

module.exports = runEmailSenderListener;
