import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetOrderByIdQuery } from '../queries/get-order-by-id.query'; // Actualizado
import { OrderRepository } from '../../infrastructure/persistence/order.repository'; // Actualizado
import { Logger, NotFoundException } from '@nestjs/common';

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdHandler implements IQueryHandler<GetOrderByIdQuery> {
  private readonly logger = new Logger(GetOrderByIdHandler.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: GetOrderByIdQuery): Promise<any> {
    const { id } = query;
    this.logger.log(`Attempting to fetch Order with ID: ${id}`);

    try {
      const order = await this.orderRepository.findById(id);
      if (!order) {
        this.logger.warn(`Order with ID ${id} not found`);
        throw new NotFoundException('Order not found');
      }

      this.logger.log(`Order with ID ${id} found successfully`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to fetch Order with ID ${id}`, error.stack);
      throw new NotFoundException('Failed to fetch Order');
    }
  }
}
