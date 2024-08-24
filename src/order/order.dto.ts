import { ApiProperty, PickType } from '@nestjs/swagger'
import { Order } from './order.entity'

export class CreateOrderDTO {
  @ApiProperty()
  user: string

  @ApiProperty()
  goods: string

  @ApiProperty()
  openid: string

  @ApiProperty({ required: false })
  remark?: string

  @ApiProperty({ default: 0 })
  remainCount: number

  @ApiProperty({ required: false })
  kafkaRawMessage?: string
}

export class UpdateOrderDTO extends PickType(Order, ['user', 'goods', 'openid', 'remark', 'kafkaRawMessage']) {
  @ApiProperty({ description: '订单id', example: '' })
  id: string
}
