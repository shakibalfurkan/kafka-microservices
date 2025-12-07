import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "email-service",
  brokers: ["localhost:9094"],
});

const producer = kafka.producer();

const consumer = kafka.consumer({
  groupId: "email-service",
  sessionTimeout: 60000,
  heartbeatInterval: 5000,
});

const run = async () => {
  try {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({
      topic: "order-successful",
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value.toString();
        const { userId, orderId } = JSON.parse(value);

        // TODO: SEND EMAIL TO USER

        const dummyEmailId = "email-abc-123";

        console.log(`Email consumer: Email sent to user id ${userId}`);

        await producer.send({
          topic: "email-successful",
          messages: [
            {
              value: JSON.stringify({ userId, emailId: dummyEmailId }),
            },
          ],
        });
      },
    });
  } catch (error) {
    console.log(error);
  }
};

run();
