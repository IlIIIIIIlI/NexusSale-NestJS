const config = {
  database: {
    ip: process.env.MYSQL_HOST || 'mysql',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || 'seckill',
  },
  redisCache: {
    host: 'redis',
    port: 6379,
    duration: 30 * 1000,
  },
  redisSeckill: {
    seckillCounterKey: 'secKillCounter',
    seckillHashKey: 'seckill-temp',
    seckillTempLockKey: 'lock-seckill-update',
    name: 'seckill',
    host: 'redis',
    port: 6379,
    db: 1,
  },
  kafkaConfig: {
    kafkaHost: 'kafka:9092',
    topic: 'PHONE_NUMBER',
    partitionMaxIndex: 0,
  },
  logger: ['error', 'warn', 'log', 'debug', 'verbose'],
}

export default config
