import { Injectable, Logger } from '@nestjs/common'
import { Kafka, Producer } from 'kafkajs'
import * as Redis from 'ioredis'
import { set } from 'lodash'
import { RedisClientService } from '../redis/redis.service'
import { getConfig } from '@root/config/index'
import { awaitWrap } from '@/utils'

const { redisSeckill, kafkaConfig } = getConfig()

@Injectable()
export class SeckillService {
  private readonly logger = new Logger(SeckillService.name)
  private seckillRedisClient!: Redis.Redis
  private producer: Producer
  private count = 0

  constructor(private readonly redisClientService: RedisClientService) {
    this.redisClientService.getSeckillRedisClient().then(client => {
      this.seckillRedisClient = client
    })

    const kafka = new Kafka({
      clientId: 'seckill-service',
      brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
    })

    this.producer = kafka.producer()
    this.producer.connect().catch(e => this.logger.error('Failed to connect to Kafka', e))
  }

  async initCount() {
    const { seckillCounterKey } = redisSeckill
    return await this.seckillRedisClient.set(seckillCounterKey, 100)
  }

  async secKill(params) {
    const { seckillCounterKey } = redisSeckill

    this.logger.log(`current requestcount：${this.count++}`)

    //TIPS: Use optimistic locking to solve high concurrency
    const [watchError] = await awaitWrap(this.seckillRedisClient.watch(seckillCounterKey)) //Listen to the counter field
    watchError && this.logger.error(watchError)
    if (watchError) return watchError

    const [getError, reply] = await awaitWrap(this.seckillRedisClient.get(seckillCounterKey))
    getError && this.logger.error(getError)
    if (getError) return getError

    if (typeof reply === 'string') {
      if (parseInt(reply) <= 0) {
        this.logger.warn('Already sold out')
        return 'Already sold out'
      }
    } else {
      this.logger.warn('Invalid reply from Redis')
      return 'Invalid reply from Redis'
    }

    //Update the counter number of redis by one
    const [execError, replies] = await awaitWrap(this.seckillRedisClient.multi().decr(seckillCounterKey).exec())
    execError && this.logger.error(execError)
    if (execError) return execError

    //The counter field is in operation, waiting for counter to be released by others
    if (!replies) {
      this.logger.warn('counter被使用')
      this.secKill(params)
      return
    }

    // this.logger.log('replies: ')
    // this.logger.verbose(replies)
    set(params, 'remainCount', replies[0]?.[1])

    const payload = {
      topic: kafkaConfig.topic,
      messages: [{ value: JSON.stringify(params) }],
    }

    this.logger.log('production data payload:')
    this.logger.verbose(payload)

    try {
      const kafkaProducerResponse = await this.producer.send(payload)
      this.logger.verbose(kafkaProducerResponse)
      return { payload, kafkaProducerResponse }
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }

  // Set remaining inventory
  async setRemainCount(remainCount: number) {
    const { seckillCounterKey } = redisSeckill

    //TIPS: Use optimistic locking to solve high concurrency
    const [watchError] = await awaitWrap(this.seckillRedisClient.watch(seckillCounterKey)) //Listen to the counter field
    watchError && this.logger.error(watchError)
    if (watchError) return watchError

    //Update the number of counters in redis
    const [execError, replies] = await awaitWrap(this.seckillRedisClient.multi().set(seckillCounterKey, remainCount).get(seckillCounterKey).exec())
    execError && this.logger.error(execError)
    if (execError) return execError

    //The counter field is in operation, waiting for counter to be released by others
    if (!replies) {
      this.logger.warn('counter被使用')
      return this.setRemainCount(remainCount)
    }

    console.log('replies: ', replies)
    return `The number of remaining products has been updated successfully! Remaining now：${replies?.[1]?.[1]}`
  }
}
