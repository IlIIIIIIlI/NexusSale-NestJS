import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common'
import * as Redis from 'ioredis'
import { awaitWrap } from '@/utils'
import { CreateOrderDTO } from '../order/order.dto'
import { OrderModule } from '../order/order.module'
import { OrderService } from '../order/order.service'
import { RedisClientService } from '../redis/redis.service'
import { getKafkaConsumer } from './kafka-utils'
import { SeckillController } from './seckill.controller'
import { SeckillService } from './seckill.service'

@Module({
  imports: [OrderModule],
  providers: [RedisClientService, SeckillService],
  controllers: [SeckillController],
})
export class SeckillModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeckillModule.name)
  private seckillRedisClient!: Redis.Redis

  constructor(
    private readonly orderService: OrderService,
    private readonly seckillService: SeckillService,
    private readonly redisClientService: RedisClientService
  ) {
    this.redisClientService.getSeckillRedisClient().then(client => {
      this.seckillRedisClient = client
    })
  }

  async handleListenerKafkaMessage() {
    const kafkaConsumer = await getKafkaConsumer()

    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        this.logger.log('The obtained producer data is:')
        this.logger.verbose({ topic, partition, offset: message.offset, value: message.value?.toString() })

        let value: CreateOrderDTO

        if (message.value) {
          value = JSON.parse(message.value.toString())
          value.kafkaRawMessage = JSON.stringify(message)

          const [err, order] = await awaitWrap(this.orderService.saveOne(value))
          if (err) {
            this.logger.error(err)
            return
          }
          this.logger.log(`Order【${order.id}】Information has been stored in the database`)
        }
      },
    })
  }

  async onApplicationBootstrap() {
    this.logger.log('onApplicationBootstrap: ')
    await this.seckillService.initCount()
    // await initKafkaTopic();  // 如果需要初始化 topic
    await this.handleListenerKafkaMessage()
  }
}
