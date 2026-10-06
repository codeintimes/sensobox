import { tr } from '../../../i18n/i18n';
// src/orders/handlers/update-quantity-processed.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateQuantityProcessedCommand } from '../commands/update-quantity-processed.command';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';

@CommandHandler(UpdateQuantityProcessedCommand)
export class UpdateQuantityProcessedHandler implements ICommandHandler<UpdateQuantityProcessedCommand> {
  private readonly logger = new Logger(UpdateQuantityProcessedHandler.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(command: UpdateQuantityProcessedCommand): Promise<void> {
    const { id, quantityProcessed } = command;
    this.logger.log(`Attempting to update quantityProcessed of OPI with ID: ${id}`);

    const order = await this.orderRepository.findById(id);
    if (!order) {
      this.logger.error(tr('errors.orderNotFound', { id }));
      throw new NotFoundException(tr('errors.orderNotFound', { id }));
    }

    try {
      await this.orderRepository.update(id, { quantityProcessed });
      this.logger.log(`quantityProcessed of OPI with ID: ${id} successfully updated`);
    } catch (error) {
      this.logger.error(`Error during quantityProcessed update of OPI with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(tr('errors.orderUpdateFailed'));
    }
  }
}
