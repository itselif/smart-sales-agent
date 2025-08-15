const { Kafka, logLevel } = require("kafkajs");

const kafka = new Kafka({
  clientId: process.env.SERVICE_CODENAME ?? "mindbricks-service",
  brokers: [process.env.KAFKA_URI || "localhost:9092"],
  logLevel: logLevel.NOTHING,
});

module.exports = kafka;
