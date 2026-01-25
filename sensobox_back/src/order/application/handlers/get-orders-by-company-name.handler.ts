import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { IOrder } from '../../domain/schemas/order.schema';
import { NotFoundException } from '@nestjs/common';
import { GetOrdersByCompanyNameQuery } from '../queries/get-orders-by-company-name.query';

@QueryHandler(GetOrdersByCompanyNameQuery)
export class GetOrdersByCompanyNameHandler implements IQueryHandler<GetOrdersByCompanyNameQuery> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: GetOrdersByCompanyNameQuery): Promise<IOrder[]> {
    const { companyName, clientName } = query;

    // Construir el filtro basado en los parámetros recibidos
    const filter = { companyName };
    if (clientName) {
      filter['clientName'] = clientName;
    }

    // Filtrar órdenes por companyName y clientName utilizando el método findAll del repositorio
    const orders = await this.orderRepository.findAll(filter);

    //console.log("orders",orders)
    //console.log("orders",filter)

    if (!orders || orders.length === 0) {
      throw new NotFoundException('No orders found for the specified company and client');
    }

    return orders;
  }
}
