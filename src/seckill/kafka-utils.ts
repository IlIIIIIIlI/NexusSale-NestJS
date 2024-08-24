import { Kafka, Consumer } from 'kafkajs'
import { getConfig } from '@root/config/index'

const { kafkaConfig } = getConfig()

let kafkaConsumer: Consumer

function getKafkaClient() {
  console.log('Creating Kafka client with brokers:', ['kafka:9092'])
  return new Kafka({
    clientId: 'seckill-service',
    brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
  })
}

export async function initKafkaTopic(): Promise<void> {
  const kafka = getKafkaClient()
  const admin = kafka.admin()

  try {
    await admin.connect()
    await admin.createTopics({
      topics: [{ topic: kafkaConfig.topic }],
    })
  } finally {
    await admin.disconnect()
  }
}

export async function getKafkaConsumer(): Promise<Consumer> {
  if (!kafkaConsumer) {
    const kafka = new Kafka({
      clientId: 'seckill-service',
      brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
    })
    kafkaConsumer = kafka.consumer({ groupId: 'seckill-group' })
    await kafkaConsumer.connect()
    await kafkaConsumer.subscribe({ topic: kafkaConfig.topic, fromBeginning: true })
  }
  return kafkaConsumer
}
