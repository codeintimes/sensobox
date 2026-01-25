

// src/orders/handlers/update-order.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrderCommand } from '../commands/update-order.command';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';

@CommandHandler(UpdateOrderCommand)
export class UpdateOrderHandler implements ICommandHandler<UpdateOrderCommand> {
  private readonly logger = new Logger(UpdateOrderHandler.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(command: UpdateOrderCommand): Promise<void> {
    const { id, dto } = command;
    this.logger.log(`Attempting to update order with ID: ${id}`);

    const order = await this.orderRepository.findById(id);
    if (!order) {
      this.logger.error(`Order with ID: ${id} not found`);
      throw new NotFoundException(`Order with ID: ${id} not found`);
    }

    try {
      await this.orderRepository.update(id, dto);
      this.logger.log(`Order with ID: ${id} successfully updated`);
    } catch (error) {
      this.logger.error(`Error during update of order with ID: ${id}`, error.stack);
      throw new InternalServerErrorException('Error occurred during order update');
    }
  }
}
