import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as chalk from 'chalk'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import * as packageJson from '../package.json'
import { getConfig } from '@root/config/index'

async function bootstrap() {
  console.log(chalk.yellow('Starting application...'))

  // 添加启动延迟
  console.log(chalk.yellow('Waiting for services to start...'))
  await new Promise(resolve => setTimeout(resolve, 30000)) // 30 秒延迟

  try {
    const app = await NestFactory.create(AppModule)
    const config = getConfig()

    // 打印环境变量和配置
    console.log(chalk.cyan('Environment variables:'))
    console.log('MYSQL_HOST:', process.env.MYSQL_HOST)
    console.log('MYSQL_ROOT_PASSWORD:', process.env.MYSQL_ROOT_PASSWORD ? '******' : 'Not set')
    console.log('REDIS_HOST:', process.env.REDIS_HOST)
    console.log('KAFKA_BROKERS:', process.env.KAFKA_BROKERS)

    console.log(chalk.cyan('Config:'))
    console.log('Database IP:', config.database.ip)
    console.log('Database Port:', config.database.port)
    console.log('Database Username:', config.database.username)
    console.log('Database Password:', config.database.password ? '******' : 'Not set')
    console.log('Redis Host:', config.redisCache.host)
    console.log('Redis Port:', config.redisCache.port)

    const options = new DocumentBuilder()
      .setTitle(`${packageJson.name}-client`)
      .setDescription(`${packageJson.description} - [StoreServer]`)
      .setVersion(packageJson.version)
      .setLicense(packageJson.license, '')
      .setContact(packageJson.author, '', packageJson.author)
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('api-docs', app, document)

    await app.listen(3000)

    console.log(chalk.green('\n服务已启动在 http://localhost:3000\n'))
    console.log(chalk.green(`\nswagger-ui服务已开启在 http://localhost:3000/api-docs\n`))
  } catch (error) {
    console.error(chalk.red('Failed to start application:'), error)
    process.exit(1)
  }
}

bootstrap().catch(err => {
  console.error(chalk.red('Unhandled error during bootstrap:'), err)
  process.exit(1)
})
