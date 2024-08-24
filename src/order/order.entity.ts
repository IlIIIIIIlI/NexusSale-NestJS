import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string

  @ApiProperty({ description: 'User', example: 'user1' })
  @Column()
  user: string

  @ApiProperty({ description: 'Goods', example: 'PS5' })
  goods: string

  @Column({ unique: true })
  openid: string

  @Column({ default: 0 })
  remainCount: number

  @ApiPropertyOptional({ description: 'Order Desc', example: 'Black Friday' })
  @Column()
  remark?: string

  @ApiPropertyOptional({ description: 'Created' })
  @CreateDateColumn()
  readonly createdDate?: Date

  @ApiPropertyOptional({ description: 'Updated' })
  @UpdateDateColumn()
  readonly updateDate?: Date

  @Column()
  kafkaRawMessage?: string //Consumption raw data obtained from kafka
}
