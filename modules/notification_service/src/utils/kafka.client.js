const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "salesai1-notification-service",
  brokers: [process.env.KAFKA_URI || "kafka:9092"],
});

module.exports = kafka;
