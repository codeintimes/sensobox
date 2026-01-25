// update-opi-initial.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOpiInitialCommand } from '../commands/update-opi-initial.command';
import { OrderRepository } from '../../infrastructure/persistence/order.repository'; // Asumiendo una estructura similar para el repositorio de OPI
import { Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateOpiInitialCommand)
export class UpdateOpiInitialHandler implements ICommandHandler<UpdateOpiInitialCommand> {
  private readonly logger = new Logger(UpdateOpiInitialHandler.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(command: UpdateOpiInitialCommand): Promise<void> {
    const { id, opiInitialDTO } = command;
    this.logger.log(`Attempting to update initial process of OPI with ID: ${id}`);

    const opiExists = await this.orderRepository.orderExistsById(id);
    if (!opiExists) {
      this.logger.warn(`OPI with ID: ${id} not found`);
      throw new NotFoundException(`OPI with ID: ${id} not found`);
    }

    try {
      // Asumiendo que el repositorio tiene un método para actualizar la fase initial de una OPI
      await this.orderRepository.updateInitialProcess(id, opiInitialDTO);
      this.logger.log(`Initial process of OPI with ID: ${id} successfully updated`);
    } catch (error) {
      this.logger.error(`Unexpected error during initial process update of OPI with ID: ${id}`, error.stack);
      throw new InternalServerErrorException('Unexpected error occurred during initial process update of OPI');
    }
  }
}
