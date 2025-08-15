const kafka = require("./kafka.client.js");

const producer = kafka.producer();
const kafkaPublish = async (topic, data) => {
  try {
    await producer.connect();
    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(data),
        },
      ],
    });
  } catch (error) {
    console.error("Error publishing", error);
  }
};

module.exports = kafkaPublish;
