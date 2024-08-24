const config = {
  database: {
    ip: 'mysql', //docker-compose link mysql host name
    port: 3306,
    username: 'root',
    password: 'password',
    database: 'seckill',
  },
  redisCache: {
    host: 'redis',
    port: 6379,
    duration: 30 * 1000, //Database query cache time 30s
  },
  redisSeckill: {
    seckillCounterKey: 'secKillCounter', //Inventory counter key
    seckillHashKey: 'seckill-temp',
    seckillTempLockKey: 'lock-seckill-update', //sync lock key
    name: 'seckill',
    host: 'redis',
    port: 6379,
    db: 1,
  },
  kafkaConfig: {
    kafkaHost: 'kafka:9092',
    topic: 'PHONE_NUMBER',
    partitionMaxIndex: 0, //When Producer sends data, the partition range is [0, partitionCount]
  },
  logger: ['error', 'warn', 'log'],
}

export default config
