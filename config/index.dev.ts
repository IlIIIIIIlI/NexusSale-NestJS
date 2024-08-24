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
    duration: 30 * 1000, //数据库查询缓存时间30s
  },
  redisSeckill: {
    seckillCounterKey: 'secKillCounter', //库存计数器key
    seckillHashKey: 'seckill-temp',
    seckillTempLockKey: 'lock-seckill-update', //同步锁的键
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
