const { Kafka } = require('kafkajs');

// Initialize the Kafka client
// We use the localhost:29092 port which is mapped in docker-compose.yml
const kafka = new Kafka({
  clientId: 'jobportal-app',
  brokers: ['localhost:29092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

/**
 * Helper to get a connected producer
 */
const getProducer = async () => {
  const producer = kafka.producer();
  await producer.connect();
  return producer;
};

/**
 * Helper to get a connected consumer
 * @param {string} groupId - The consumer group ID
 */
const getConsumer = async (groupId) => {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  return consumer;
};

module.exports = {
  kafka,
  getProducer,
  getConsumer,
};
