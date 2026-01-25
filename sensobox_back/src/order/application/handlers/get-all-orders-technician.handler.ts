import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllOrdersTechnicianQuery } from '../queries/get-all-orders-technician.query'; // Cambio de nombre
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { IOrder } from '../../domain/schemas/order.schema';
import { Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';

@QueryHandler(GetAllOrdersTechnicianQuery) // Cambio de nombre
export class GetAllOrdersTechnicianHandler implements IQueryHandler<GetAllOrdersTechnicianQuery> { // Cambio de nombre
  private readonly logger = new Logger(GetAllOrdersTechnicianHandler.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: GetAllOrdersTechnicianQuery): Promise<IOrder[]> { // Cambio de nombre
    const { user } = query; // Suponiendo que user tiene el nombre del técnico y la compañía

    this.logger.log(`Fetching all Orders for technician: ${user.name} from company: ${user.companyName}`);

    try {
      // Buscar órdenes que coincidan con el nombre del técnico y la compañía
      //console.log(user)
      const orders = await this.orderRepository.findAll({
        technician: user.name,
        companyName: user.companyName,
      });

      this.logger.log(`Successfully fetched ${orders.length} Orders for technician: ${user.name}`);
      return orders;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to fetch Orders', error.stack);
      throw new InternalServerErrorException('Failed to fetch Orders');
    }
  }
}
