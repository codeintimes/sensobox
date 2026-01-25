// src/orders/handlers/update-material-info.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateMaterialInfoCommand } from '../commands/update-material-info.command';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';

@CommandHandler(UpdateMaterialInfoCommand)
export class UpdateMaterialInfoHandler implements ICommandHandler<UpdateMaterialInfoCommand> {
  private readonly logger = new Logger(UpdateMaterialInfoHandler.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(command: UpdateMaterialInfoCommand): Promise<void> {
    const { id, materialWeight, materialArea } = command;
    this.logger.log(`Attempting to update material info of OPI with ID: ${id}`);
    this.logger.log(id, materialWeight, materialArea);

    const order = await this.orderRepository.findById(id);
    if (!order) {
      this.logger.error(`OPI with ID: ${id} not found`);
      throw new NotFoundException(`OPI with ID: ${id} not found`);
    }
console
    try {
      await this.orderRepository.update(id, { materialWeight, materialArea });

      this.logger.log(`Material info of OPI with ID: ${id} successfully updated`);
    } catch (error) {
      this.logger.error(`Error during material info update of OPI with ID: ${id}`, error.stack);
      throw new InternalServerErrorException('Error occurred during material info update of OPI');
    }
  }
}
