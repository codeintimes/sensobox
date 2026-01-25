// src/orders/commands/update-order.command.ts
import { ICommand } from '@nestjs/cqrs';
import { OrderUpdateDto } from '../dto/order-update.dto';

export class UpdateOrderCommand implements ICommand {
  constructor(public readonly id: string, public readonly dto: OrderUpdateDto) {}
}
