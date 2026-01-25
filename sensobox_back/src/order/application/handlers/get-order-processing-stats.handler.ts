import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderModel, IOrder } from '../../domain/schemas/order.schema';
import { GetOrderProcessingStatsQuery } from '../queries/get-order-processing-stats.query';
import { OrderProcessingStatsDTO } from '../dto/order-processing-stats.dto';

@QueryHandler(GetOrderProcessingStatsQuery)
export class GetOrderProcessingStatsHandler implements IQueryHandler<GetOrderProcessingStatsQuery> {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<IOrder>
  ) {}

  async execute(query: GetOrderProcessingStatsQuery): Promise<OrderProcessingStatsDTO[]> {
    const { fromDate, companyName, clientName } = query;

    // Crear objeto de filtro
    const filter: any = { 
      createdAt: { $gte: fromDate, $lte: new Date() },
      companyName: companyName
    };

    // Agregar filtro de cliente si se proporciona
    if (clientName) {
      filter.clientName = clientName;
    }

    // Buscar las órdenes que cumplen con el filtro
    const orders = await this.orderModel.find(filter).sort({ createdAt: 1 }).exec();

    // Mapear las órdenes encontradas al formato deseado
    return orders.map(order => ({
      createdAt: order.createdAt.toISOString(),
      processingTime: order.processingTime,
      processingTimeReal: order.processingTimeFinal,
      processingTimeRate: order.processingTimeRate,
      clientName: order.clientName,
    }));
  }
}
