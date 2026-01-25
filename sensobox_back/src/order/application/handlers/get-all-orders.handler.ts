import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllOrdersQuery } from '../queries/get-all-orders.query'; // Actualizado
import { OrderRepository } from '../../infrastructure/persistence/order.repository'; // Actualizado
import { OrderModel, IOrder } from '../../domain/schemas/order.schema'; // Actualizado
import { Logger, InternalServerErrorException } from '@nestjs/common';

@QueryHandler(GetAllOrdersQuery)
export class GetAllOrdersHandler implements IQueryHandler<GetAllOrdersQuery> {
  private readonly logger = new Logger(GetAllOrdersHandler.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: GetAllOrdersQuery): Promise<IOrder[]> {
    this.logger.log('Fetching all Orders');

    try {
      const orders = await this.orderRepository.findAll();
      //console.log()
      this.logger.log(`Successfully fetched ${orders.length} Orders`);
      return orders;
    } catch (error) {
      this.logger.error('Failed to fetch Orders', error.stack);
      throw new InternalServerErrorException('Failed to fetch Orders');
    }
  }
}
