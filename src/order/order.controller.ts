import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateOrderDTO, UpdateOrderDTO } from './order.dto'
import { Order } from './order.entity'
import { OrderService } from './order.service'

@ApiTags('Order management')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/all')
  @ApiOperation({ description: 'Get all orders' })
  order(): Promise<Order[]> {
    return this.orderService.getAllOrder()
  }

  @ApiOperation({ description: 'Get orders according to id' })
  @Get(':id')
  async getRoleById(@Param('id') id: string) {
    const role = await this.orderService.findOneById(id)
    return role
  }

  @ApiOperation({ description: 'add more orders' })
  @Post()
  async addRole(@Body() roleInfo: CreateOrderDTO) {
    try {
      console.log('Received order:', roleInfo)
      const saveResult = await this.orderService.saveOne(roleInfo)
      console.log('Save result:', saveResult)
      return saveResult
    } catch (error) {
      console.error('Error in addRole:', error)
    }
  }

  @ApiOperation({ description: 'update orders' })
  @Put()
  async updateRole(@Body() role: UpdateOrderDTO) {
    const { id: roleId, ...roleInfo } = role

    const saveResult = await this.orderService.updateOne(roleId, roleInfo)
    return saveResult
  }

  @ApiOperation({ description: 'delete orders' })
  @ApiBody({
    schema: {
      example: ['1sf6g4s8g4sg'],
    },
  })
  @Delete()
  async deleteRole(@Body() roleIds: string[]) {
    const deleteResult = await this.orderService.deleteByIds(roleIds)
    return deleteResult
  }
}
