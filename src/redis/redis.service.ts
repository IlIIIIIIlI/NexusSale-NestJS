import { Injectable } from '@nestjs/common'
import { RedisService } from 'nestjs-redis'

@Injectable()
export class RedisClientService {
  constructor(private readonly redisService: RedisService) {}

  //The connection configuration has been set in app.module
  async getSeckillRedisClient() {
    return await this.redisService.getClient('seckill')
  }
}
