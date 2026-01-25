import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderModel, IOrder } from '../../domain/schemas/order.schema';
import { GetOrderStatsQuery } from '../queries/get-order-stats.query';
import { OrderStatsDTO } from '../dto/order-stats.dto';
@QueryHandler(GetOrderStatsQuery)
export class GetOrderStatsHandler implements IQueryHandler<GetOrderStatsQuery> {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<IOrder>
  ) {}

  async execute(query: GetOrderStatsQuery): Promise<OrderStatsDTO[]> {
    const { fromDate, companyName, clientName } = query;
    const filter: any = {
      createdAt: { $gte: fromDate, $lte: new Date() },
      finalQuantity: { $ne: null },
      quantityRate: { $ne: null },
      initialQuantity: { $ne: null }
    };

    // Agregar filtros de companyName y clientName si están presentes en la consulta
    if (companyName) {
      filter.companyName = companyName;
    }
    if (clientName && clientName !== 'undefined') {
      filter.clientName = clientName;
    }
    console.log("orders",filter)
    const orders = await this.orderModel.find(filter)
      .sort({ createdAt: 1 })
      .exec();
      console.log("orders",orders[0])
    if (!orders || orders.length === 0) {
      return [];
    }

    // Filtrar órdenes duplicadas y mapear a OrderStatsDTO
    const uniqueOrders = orders.filter((order, index, self) =>
      index === self.findIndex(t => t.createdAt.getTime() === order.createdAt.getTime())
    );
    console.log("uniqueOrders",uniqueOrders[0])
    return uniqueOrders.map(order => ({
      finalQuantity: order.finalQuantity,
      quantityRate: order.quantityRate,
      initialQuantity: order.initialQuantity,
      clientName: order.clientName,
      createdAt: order.createdAt.toISOString()
    }));
  }
}
