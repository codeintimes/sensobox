import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteOrderCommand } from '../commands/delete-order.command'; // Asegúrate de actualizar el comando para reflejar la entidad Order
import { OrderRepository } from '../../infrastructure/persistence/order.repository'; // Actualizado para usar OrderRepository
import { Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common'; 

@CommandHandler(DeleteOrderCommand)
export class DeleteOrderHandler implements ICommandHandler<DeleteOrderCommand> {
  private readonly logger = new Logger(DeleteOrderHandler.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(command: DeleteOrderCommand): Promise<void> {
    const { id } = command;
    this.logger.log(`Attempting to delete Order with ID: ${id}`);

    const orderExists = await this.orderRepository.orderExistsById(id);
    if (!orderExists) {
      this.logger.warn(`Order with ID: ${id} not found`);
      throw new NotFoundException(`Order with ID: ${id} not found`);
    }    

    try {
      const deleted = await this.orderRepository.delete(id);
      if (!deleted) {
        this.logger.error(`Failed to delete Order with ID: ${id}`);
        throw new InternalServerErrorException(`Failed to delete Order with ID: ${id}`);
      }

      this.logger.log(`Order with ID: ${id} successfully deleted`);
    } catch (error) {
      this.logger.error(`Unexpected error during deletion of Order with ID: ${id}`, error.stack);
      throw new InternalServerErrorException('Unexpected error occurred during Order deletion');
    }
  }
}
