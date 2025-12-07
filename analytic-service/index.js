import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "analytic-service",
  brokers: ["localhost:9094"],
});

const consumer = kafka.consumer({
  groupId: "analytic-service",
  sessionTimeout: 60000,
  heartbeatInterval: 5000,
});

const runConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({
      topic: "payment-successful",
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value.toString();
        const { userId, cart } = JSON.parse(value);
        const total = cart
          .reduce((acc, item) => acc + item.price, 0)
          .toFixed(2);

        console.log(`Analytic consumer: User ${userId} paid ${total}`);
      },
    });
  } catch (error) {
    console.log(error);
  }
};

runConsumer();
