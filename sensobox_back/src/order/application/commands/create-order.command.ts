import { ICommand } from '@nestjs/cqrs';
import { OrderDto } from '../dto/order.dto'; // Asegúrate de que este DTO esté actualizado

export class CreateOrderCommand implements ICommand {
  constructor(
    public readonly orderDto: OrderDto
  ) {}
}
