import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OrderStatisticsDTO } from '../dto/order-statistics.dto';
import { GetOrderStatsLastMonthQuery } from '../queries/get-order-stats-last-month.query';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderModel, IOrder } from '../../domain/schemas/order.schema';

@QueryHandler(GetOrderStatsLastMonthQuery)
export class GetOrderStatsLastMonthHandler implements IQueryHandler<GetOrderStatsLastMonthQuery> {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<IOrder>
  ) {}

  async execute(query: GetOrderStatsLastMonthQuery): Promise<OrderStatisticsDTO> {
    const { companyName } = query;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Filtrar las órdenes por companyName y la fecha calculada
    const orders = await this.orderModel.find({
      companyName: companyName,
      createdAt: { $gt: oneMonthAgo }
    });

    // Procesar los datos obtenidos para calcular estadísticas
    const statistics = new OrderStatisticsDTO();
    statistics.totalProductionQuantityLastMonth = orders.reduce((sum, order) => sum + (order.productionQuantity || 0), 0)  || 0;
    statistics.orderCountLastMonth = orders.length || 0;
    statistics.totalProcessingTimeDifferenceLastMonth = orders.reduce((sum, order) => sum + (order.processingTimeDifference || 0), 0) / orders.length  || 0;
    statistics.totalFinalQuantityDifferenceLastMonth = orders.reduce((sum, order) => sum + (order.finalQuantityDifference || 0), 0) / orders.length  || 0;
    // statistics.totalProcessingDateDifferenceLastMonth = orders.reduce((sum, order) => sum + (order.processingDateRate || 0), 0) / orders.length;

    return statistics;
  }
}
